export interface GeoResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const getCurrentLocation = (): Promise<GeoResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('您的裝置或瀏覽器不支援 GPS 地理定位功能'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = '無法取得目前位置';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = '位置存取權限已被拒絕。請在瀏覽器網址列旁允許位置權限。';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = '目前位置訊號不可用，請稍後重試。';
            break;
          case error.TIMEOUT:
            msg = '取得位置逾時，請至收訊良好的地方重試。';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
};

export const createGoogleMapsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

export const formatCoordinates = (lat?: number, lng?: number): string => {
  if (lat === undefined || lng === undefined) return '';
  const latStr = lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`;
  const lngStr = lng >= 0 ? `${lng.toFixed(4)}°E` : `${Math.abs(lng).toFixed(4)}°W`;
  return `${latStr}, ${lngStr}`;
};
