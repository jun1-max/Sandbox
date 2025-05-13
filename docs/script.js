document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-sensors');

    // DOM要素の取得
    const latitudeElem = document.getElementById('latitude');
    const longitudeElem = document.getElementById('longitude');
    const accuracyElem = document.getElementById('accuracy');
    const altitudeElem = document.getElementById('altitude');
    const altitudeAccuracyElem = document.getElementById('altitudeAccuracy');
    const speedElem = document.getElementById('speed');
    const headingGpsElem = document.getElementById('heading-gps');

    const alphaElem = document.getElementById('alpha');
    const betaElem = document.getElementById('beta');
    const gammaElem = document.getElementById('gamma');
    const absoluteElem = document.getElementById('absolute');
    const webkitHeadingElem = document.getElementById('webkit-heading');

    const accelXElem = document.getElementById('accel-x');
    const accelYElem = document.getElementById('accel-y');
    const accelZElem = document.getElementById('accel-z');
    const accelGXELEM = document.getElementById('accel-gx');
    const accelGYElem = document.getElementById('accel-gy');
    const accelGZElem = document.getElementById('accel-gz');
    const rotationAlphaElem = document.getElementById('rotation-alpha');
    const rotationBetaElem = document.getElementById('rotation-beta');
    const rotationGammaElem = document.getElementById('rotation-gamma');

    const errorLogElem = document.getElementById('error-log');

    function logError(message) {
        const p = document.createElement('p');
        p.textContent = `エラー: ${message}`;
        errorLogElem.appendChild(p);
        console.error(message);
    }

    function requestPermissionsAndStartSensors() {
        // DeviceOrientationEvent と DeviceMotionEvent のパーミッションリクエスト (主にiOS 13+)
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleMotionEvent);
                    } else {
                        logError('加速度センサーの利用が許可されませんでした。');
                    }
                })
                .catch(error => {
                    logError(`加速度センサーのパーミッションリクエスト中にエラー: ${error.message}`);
                });
        } else {
            // requestPermission がないブラウザ (Android Chromeなど) は直接イベントリスナーを追加
            window.addEventListener('devicemotion', handleMotionEvent);
        }

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientationEvent);
                    } else {
                        logError('ジャイロセンサーの利用が許可されませんでした。');
                    }
                })
                .catch(error => {
                    logError(`ジャイロセンサーのパーミッションリクエスト中にエラー: ${error.message}`);
                });
        } else {
            window.addEventListener('deviceorientation', handleOrientationEvent);
        }

        // Geolocation APIの開始
        startGeolocation();
    }


    // 1. 位置情報 (GPS) の取得
    function startGeolocation() {
        if ('geolocation' in navigator) {
            const geoOptions = {
                enableHighAccuracy: true, // 高精度な位置情報を要求
                timeout: 10000,           // タイムアウト (ミリ秒)
                maximumAge: 0             // キャッシュされた位置情報の有効期間 (0は常に新しい情報を要求)
            };

            navigator.geolocation.watchPosition(
                (position) => {
                    latitudeElem.textContent = position.coords.latitude.toFixed(6);
                    longitudeElem.textContent = position.coords.longitude.toFixed(6);
                    accuracyElem.textContent = position.coords.accuracy ? position.coords.accuracy.toFixed(2) : '---';
                    altitudeElem.textContent = position.coords.altitude ? position.coords.altitude.toFixed(2) : '---';
                    altitudeAccuracyElem.textContent = position.coords.altitudeAccuracy ? position.coords.altitudeAccuracy.toFixed(2) : '---';
                    speedElem.textContent = position.coords.speed ? position.coords.speed.toFixed(2) : '---';
                    headingGpsElem.textContent = position.coords.heading ? position.coords.heading.toFixed(2) : '---';
                },
                (error) => {
                    let message = '';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "位置情報の取得が許可されませんでした。";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "位置情報が取得できませんでした。";
                            break;
                        case error.TIMEOUT:
                            message = "位置情報の取得がタイムアウトしました。";
                            break;
                        default:
                            message = `不明なエラーが発生しました (コード: ${error.code})。`;
                            break;
                    }
                    logError(`Geolocation: ${message}`);
                },
                geoOptions
            );
        } else {
            logError('このブラウザはGeolocation APIをサポートしていません。');
        }
    }

    // 2. デバイスの向き (方角) の取得
    function handleOrientationEvent(event) {
        // alpha: デバイスのZ軸周りの回転 (0-360度)。これが方角に相当します。
        //        多くのデバイスでは磁力計と統合され、北を基準とした値を提供しようとしますが、
        //        デバイスやブラウザにより基準が異なる場合や、較正が必要な場合があります。
        // beta: デバイスのX軸周りの回転 (-180から180度)。前後の傾き。
        // gamma: デバイスのY軸周りの回転 (-90から90度)。左右の傾き。
        // absolute: trueの場合、地球の座標系に基づいた絶対的な向きを提供。falseの場合はデバイス依存。
        // webkitCompassHeading: Safariなどで提供される、より直接的なコンパスの方角。

        alphaElem.textContent = event.alpha !== null ? event.alpha.toFixed(2) : '---';
        betaElem.textContent = event.beta !== null ? event.beta.toFixed(2) : '---';
        gammaElem.textContent = event.gamma !== null ? event.gamma.toFixed(2) : '---';
        absoluteElem.textContent = event.absolute !== null ? event.absolute : '---';

        if (event.webkitCompassHeading !== undefined) {
            webkitHeadingElem.textContent = event.webkitCompassHeading.toFixed(2);
        } else {
            webkitHeadingElem.textContent = '--- (非対応)';
        }
    }

    // 3. 加速度の測定
    function handleMotionEvent(event) {
        // event.acceleration: 重力の影響を除いた加速度 (m/s^2)
        //   .x: 左右
        //   .y: 前後
        //   .z: 上下
        if (event.acceleration) {
            accelXElem.textContent = event.acceleration.x !== null ? event.acceleration.x.toFixed(2) : '---';
            accelYElem.textContent = event.acceleration.y !== null ? event.acceleration.y.toFixed(2) : '---';
            accelZElem.textContent = event.acceleration.z !== null ? event.acceleration.z.toFixed(2) : '---';
        } else {
            accelXElem.textContent = '--- (非対応)';
            accelYElem.textContent = '--- (非対応)';
            accelZElem.textContent = '--- (非対応)';
        }

        // event.accelerationIncludingGravity: 重力の影響を含む加速度 (m/s^2)
        //   デバイスが静止している場合、重力加速度 (約9.8 m/s^2) がいずれかの軸に現れます。
        if (event.accelerationIncludingGravity) {
            accelGXELEM.textContent = event.accelerationIncludingGravity.x !== null ? event.accelerationIncludingGravity.x.toFixed(2) : '---';
            accelGYElem.textContent = event.accelerationIncludingGravity.y !== null ? event.accelerationIncludingGravity.y.toFixed(2) : '---';
            accelGZElem.textContent = event.accelerationIncludingGravity.z !== null ? event.accelerationIncludingGravity.z.toFixed(2) : '---';
        } else {
            accelGXELEM.textContent = '--- (非対応)';
            accelGYElem.textContent = '--- (非対応)';
            accelGZElem.textContent = '--- (非対応)';
        }

        // event.rotationRate: 回転速度 (度/秒)
        //   .alpha: Z軸周り
        //   .beta: X軸周り
        //   .gamma: Y軸周り
        if (event.rotationRate) {
            rotationAlphaElem.textContent = event.rotationRate.alpha !== null ? event.rotationRate.alpha.toFixed(2) : '---';
            rotationBetaElem.textContent = event.rotationRate.beta !== null ? event.rotationRate.beta.toFixed(2) : '---';
            rotationGammaElem.textContent = event.rotationRate.gamma !== null ? event.rotationRate.gamma.toFixed(2) : '---';
        } else {
            rotationAlphaElem.textContent = '--- (非対応)';
            rotationBetaElem.textContent = '--- (非対応)';
            rotationGammaElem.textContent = '--- (非対応)';
        }
    }

    // 開始ボタンのイベントリスナー
    startButton.addEventListener('click', () => {
        requestPermissionsAndStartSensors();
        startButton.disabled = true; // 一度開始したらボタンを無効化
        startButton.textContent = 'センサー監視中...';
    });

});
