export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ==========================================================================
 * ✈️ 旅費分帳通 (Travel Split PWA) - Google Apps Script 後端串接腳本
 * ==========================================================================
 * 
 * 【部署步驟指引】：
 * 1. 在 Google 雲端硬碟建立一個新的「Google 試算表 (Google Sheets)」
 * 2. 點選試算表上方選單「擴充功能 (Extensions)」->「Apps Script」
 * 3. 刪除編輯器內預設代碼，將本腳本完整複製並貼上
 * 4. 點選右上角藍色「部署 (Deploy)」按鈕 -> 選擇「新增部署作業 (New deployment)」
 * 5. 齒輪圖示選擇「網頁應用程式 (Web app)」：
 *    - 說明 (Description)：旅費分帳通 API
 *    - 執行身分 (Execute as)：我 (Me)
 *    - 誰可以存取 (Who has access)：所有人 (Anyone)  <-- 務必選擇 Anyone！
 * 6. 點擊「部署」，授權 Google 帳號權限
 * 7. 複製產生的「網頁應用程式網址 (Web app URL)」(以 /exec 結尾)
 * 8. 回到「旅費分帳通」網頁，在「設定」中貼上該網址，即可完成即時雲端雙向同步！
 * ==========================================================================
 */

// 設定試算表工作表名稱
var EXPENSES_SHEET_NAME = "開銷明細";
var CONFIG_SHEET_NAME = "旅程設定";

/**
 * 處理 GET 請求：讀取旅程設定與所有開銷清單
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var trip = getTripConfig_(ss);
    var expenses = getExpensesList_(ss);

    var response = {
      status: "success",
      trip: trip,
      expenses: expenses,
      timestamp: new Date().getTime()
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 處理 POST 請求：接收前端同步資料或新增單筆記帳
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "";
    var data = {};
    if (contents) {
      data = JSON.parse(contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "syncAll";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "syncAll") {
      // 完整同步：更新旅程設定並覆寫開銷明細
      if (data.trip) {
        saveTripConfig_(ss, data.trip);
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        saveExpensesList_(ss, data.expenses);
      }
    } else if (action === "addExpense") {
      // 新增單筆開銷
      if (data.expense) {
        appendExpenseRow_(ss, data.expense);
      }
    }

    var result = {
      status: "success",
      message: "資料已成功儲存至 Google 試算表",
      timestamp: new Date().getTime()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 取得或建立工作表
 */
function getOrCreateSheet_(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * 讀取旅程設定
 */
function getTripConfig_(ss) {
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  try {
    var rawJson = sheet.getRange("A2").getValue();
    if (rawJson) {
      return JSON.parse(rawJson);
    }
  } catch (e) {
    // 忽略格式解析錯誤
  }
  return null;
}

/**
 * 儲存旅程設定
 */
function saveTripConfig_(ss, trip) {
  var sheet = getOrCreateSheet_(ss, CONFIG_SHEET_NAME);
  sheet.clear();
  sheet.getRange("A1:B1").setValues([["旅程 JSON 資料", "最後更新時間"]]);
  sheet.getRange("A1:B1").setBackground("#0d9488").setFontColor("#ffffff").setFontWeight("bold");
  sheet.getRange("A2:B2").setValues([[JSON.stringify(trip), new Date().toLocaleString()]]);
  sheet.autoResizeColumns(1, 2);
}

/**
 * 讀取所有開銷明細
 */
function getExpensesList_(ss) {
  var sheet = ss.getSheetByName(EXPENSES_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data = sheet.getDataRange().getValues();
  var expenses = [];

  // 第 1 列為標題，從第 2 列開始讀取
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // 無 ID 略過

    var splitMembers = [];
    try {
      splitMembers = row[6] ? JSON.parse(row[6]) : [];
    } catch(e) {
      splitMembers = row[6] ? String(row[6]).split(",") : [];
    }

    expenses.push({
      id: String(row[0]),
      date: String(row[1]),
      time: String(row[2]),
      title: String(row[3]),
      amount: Number(row[4]) || 0,
      payerId: String(row[5]),
      splitMemberIds: splitMembers,
      category: String(row[7]),
      locationName: String(row[8] || ""),
      latitude: row[9] ? Number(row[9]) : undefined,
      longitude: row[10] ? Number(row[10]) : undefined,
      note: String(row[11] || ""),
      createdAt: row[12] ? Number(row[12]) : new Date().getTime()
    });
  }
  return expenses;
}

/**
 * 完整覆寫所有開銷明細
 */
function saveExpensesList_(ss, expenses) {
  var sheet = getOrCreateSheet_(ss, EXPENSES_SHEET_NAME);
  sheet.clear();

  var headers = [
    "記帳ID",
    "日期",
    "時間",
    "項目名稱",
    "金額",
    "付款人ID",
    "分攤成員IDs",
    "分類",
    "地點名稱",
    "緯度(Lat)",
    "經度(Lng)",
    "備註說明",
    "建立時間戳",
    "Google Maps 快速連結"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#0d9488")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  if (expenses.length === 0) return;

  var rows = expenses.map(function(item) {
    var mapsUrl = (item.latitude && item.longitude)
      ? "https://www.google.com/maps/search/?api=1&query=" + item.latitude + "," + item.longitude
      : "";

    return [
      item.id,
      item.date || "",
      item.time || "",
      item.title || "",
      Number(item.amount) || 0,
      item.payerId || "",
      JSON.stringify(item.splitMemberIds || []),
      item.category || "other",
      item.locationName || "",
      item.latitude || "",
      item.longitude || "",
      item.note || "",
      item.createdAt || new Date().getTime(),
      mapsUrl
    ];
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 5, rows.length, 1).setNumberFormat("#,##0");
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 新增單筆開銷
 */
function appendExpenseRow_(ss, item) {
  var sheet = getOrCreateSheet_(ss, EXPENSES_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    saveExpensesList_(ss, [item]);
    return;
  }

  var mapsUrl = (item.latitude && item.longitude)
    ? "https://www.google.com/maps/search/?api=1&query=" + item.latitude + "," + item.longitude
    : "";

  var row = [
    item.id,
    item.date || "",
    item.time || "",
    item.title || "",
    Number(item.amount) || 0,
    item.payerId || "",
    JSON.stringify(item.splitMemberIds || []),
    item.category || "other",
    item.locationName || "",
    item.latitude || "",
    item.longitude || "",
    item.note || "",
    item.createdAt || new Date().getTime(),
    mapsUrl
  ];

  sheet.appendRow(row);
}
`;
