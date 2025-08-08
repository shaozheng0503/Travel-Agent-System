// 高级工具页面JavaScript
let advancedMap;
let currentPolyline = null;
let currentPolygon = null;
let currentMarkers = [];

// API Key
const API_KEY = 'ce54301973a263c142c2e5aa8b19ebee';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initAdvancedMap();
});

// 初始化高级地图
function initAdvancedMap() {
    advancedMap = new AMap.Map('advanced-map', {
        zoom: 11,
        center: [116.397428, 39.90923], // 北京
        mapStyle: 'amap://styles/normal'
    });
    
    // 添加地图控件
    advancedMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
        advancedMap.addControl(new AMap.ToolBar());
        advancedMap.addControl(new AMap.Scale());
    });
}

// 显示工具标签页
function showToolTab(toolType, tabName) {
    // 隐藏所有标签页
    document.querySelectorAll(`#${toolType}-${tabName}`).forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 移除所有标签按钮的active类
    document.querySelectorAll(`#${toolType} .nav-tab`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    document.getElementById(`${toolType}-${tabName}`).classList.add('active');
    
    // 激活对应的标签按钮
    event.target.classList.add('active');
}

// GPS坐标转高德坐标
function convertGPS() {
    const lng = document.getElementById('gps-lng').value;
    const lat = document.getElementById('gps-lat').value;
    
    if (!lng || !lat) {
        showMessage('请输入GPS坐标', 'error');
        return;
    }
    
    fetch(`https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${lng},${lat}&coordsys=gps&output=json&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                const result = data.locations;
                document.getElementById('coordinate-result').innerHTML = `
                    <strong>转换结果：</strong><br>
                    GPS坐标: ${lng}, ${lat}<br>
                    高德坐标: ${result}<br>
                    <button onclick="showOnMap('${result}')" class="btn" style="margin-top: 10px;">在地图上显示</button>
                `;
                showMessage('坐标转换成功', 'success');
            } else {
                showMessage('坐标转换失败', 'error');
            }
        })
        .catch(error => {
            showMessage('坐标转换失败', 'error');
        });
}

// 百度坐标转高德坐标
function convertBaidu() {
    const lng = document.getElementById('baidu-lng').value;
    const lat = document.getElementById('baidu-lat').value;
    
    if (!lng || !lat) {
        showMessage('请输入百度坐标', 'error');
        return;
    }
    
    fetch(`https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${lng},${lat}&coordsys=baidu&output=json&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                const result = data.locations;
                document.getElementById('baidu-result').innerHTML = `
                    <strong>转换结果：</strong><br>
                    百度坐标: ${lng}, ${lat}<br>
                    高德坐标: ${result}<br>
                    <button onclick="showOnMap('${result}')" class="btn" style="margin-top: 10px;">在地图上显示</button>
                `;
                showMessage('坐标转换成功', 'success');
            } else {
                showMessage('坐标转换失败', 'error');
            }
        })
        .catch(error => {
            showMessage('坐标转换失败', 'error');
        });
}

// 谷歌坐标转高德坐标
function convertGoogle() {
    const lng = document.getElementById('google-lng').value;
    const lat = document.getElementById('google-lat').value;
    
    if (!lng || !lat) {
        showMessage('请输入谷歌坐标', 'error');
        return;
    }
    
    fetch(`https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${lng},${lat}&coordsys=google&output=json&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                const result = data.locations;
                document.getElementById('google-result').innerHTML = `
                    <strong>转换结果：</strong><br>
                    谷歌坐标: ${lng}, ${lat}<br>
                    高德坐标: ${result}<br>
                    <button onclick="showOnMap('${result}')" class="btn" style="margin-top: 10px;">在地图上显示</button>
                `;
                showMessage('坐标转换成功', 'success');
            } else {
                showMessage('坐标转换失败', 'error');
            }
        })
        .catch(error => {
            showMessage('坐标转换失败', 'error');
        });
}

// 轨迹纠偏
function correctTrack() {
    const coordinates = document.getElementById('track-coordinates').value.trim();
    
    if (!coordinates) {
        showMessage('请输入轨迹坐标', 'error');
        return;
    }
    
    const coordArray = coordinates.split('\n').filter(line => line.trim());
    const coordString = coordArray.join('|');
    
    fetch(`https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${coordString}&coordsys=gps&output=json&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                const correctedCoords = data.locations.split('|');
                let result = '<strong>纠偏结果：</strong><br>';
                
                correctedCoords.forEach((coord, index) => {
                    result += `点${index + 1}: ${coord}<br>`;
                });
                
                result += `<button onclick="showTrackOnMap('${data.locations}')" class="btn" style="margin-top: 10px;">在地图上显示轨迹</button>`;
                
                document.getElementById('track-result').innerHTML = result;
                showMessage('轨迹纠偏成功', 'success');
            } else {
                showMessage('轨迹纠偏失败', 'error');
            }
        })
        .catch(error => {
            showMessage('轨迹纠偏失败', 'error');
        });
}

// 高级POI搜索
function advancedPOISearch() {
    const keyword = document.getElementById('advanced-keyword').value.trim();
    const type = document.getElementById('advanced-type').value;
    const lng = document.getElementById('search-lng').value;
    const lat = document.getElementById('search-lat').value;
    const radius = document.getElementById('search-radius').value;
    
    if (!keyword) {
        showMessage('请输入搜索关键词', 'error');
        return;
    }
    
    let url = `https://restapi.amap.com/v3/place/around?key=${API_KEY}&keywords=${encodeURIComponent(keyword)}&radius=${radius}`;
    
    if (lng && lat) {
        url += `&location=${lng},${lat}`;
    }
    
    if (type) {
        url += `&types=${encodeURIComponent(type)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.pois.length) {
                let result = `<strong>搜索结果 (${data.pois.length}个)：</strong><br>`;
                
                data.pois.forEach((poi, index) => {
                    result += `${index + 1}. ${poi.name}<br>`;
                    result += `   地址: ${poi.address}<br>`;
                    result += `   类型: ${poi.type}<br>`;
                    result += `   距离: ${poi.distance}米<br>`;
                    result += `   坐标: ${poi.location}<br><br>`;
                });
                
                result += `<button onclick="showPOIsOnMap('${JSON.stringify(data.pois)}')" class="btn" style="margin-top: 10px;">在地图上显示</button>`;
                
                document.getElementById('advanced-poi-result').innerHTML = result;
                showMessage(`找到 ${data.pois.length} 个POI`, 'success');
            } else {
                showMessage('未找到相关POI', 'info');
            }
        })
        .catch(error => {
            showMessage('POI搜索失败', 'error');
        });
}

// 地理围栏检测
function checkFence() {
    const fenceCoords = document.getElementById('fence-coordinates').value.trim();
    const testLng = document.getElementById('test-lng').value;
    const testLat = document.getElementById('test-lat').value;
    
    if (!fenceCoords || !testLng || !testLat) {
        showMessage('请输入围栏坐标和测试点坐标', 'error');
        return;
    }
    
    // 简单的点在多边形内检测算法
    const fencePoints = fenceCoords.split('\n').filter(line => line.trim()).map(line => {
        const [lng, lat] = line.split(',').map(Number);
        return { lng, lat };
    });
    
    const testPoint = { lng: parseFloat(testLng), lat: parseFloat(testLat) };
    const isInside = pointInPolygon(testPoint, fencePoints);
    
    let result = `<strong>围栏检测结果：</strong><br>`;
    result += `测试点: ${testLng}, ${testLat}<br>`;
    result += `围栏点数: ${fencePoints.length}<br>`;
    result += `检测结果: ${isInside ? '在围栏内' : '在围栏外'}<br>`;
    result += `<button onclick="showFenceOnMap('${fenceCoords}', '${testLng},${testLat}')" class="btn" style="margin-top: 10px;">在地图上显示</button>`;
    
    document.getElementById('fence-result').innerHTML = result;
    showMessage(`检测完成: ${isInside ? '在围栏内' : '在围栏外'}`, 'success');
}

// 点在多边形内检测算法
function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i].lat > point.lat) !== (polygon[j].lat > point.lat)) &&
            (point.lng < (polygon[j].lng - polygon[i].lng) * (point.lat - polygon[i].lat) / (polygon[j].lat - polygon[i].lat) + polygon[i].lng)) {
            inside = !inside;
        }
    }
    return inside;
}

// 路径优化
function optimizeRoute() {
    const waypoints = document.getElementById('waypoints').value.trim();
    const optimizeType = document.getElementById('optimize-type').value;
    
    if (!waypoints) {
        showMessage('请输入途经点', 'error');
        return;
    }
    
    const points = waypoints.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split(',');
        return {
            lng: parseFloat(parts[0]),
            lat: parseFloat(parts[1]),
            name: parts[2] || '未知地点'
        };
    });
    
    if (points.length < 2) {
        showMessage('至少需要2个途经点', 'error');
        return;
    }
    
    // 简单的距离优化算法
    const optimizedRoute = optimizeRouteByDistance(points, optimizeType);
    
    let result = `<strong>路径优化结果 (${optimizeType === 'distance' ? '最短距离' : '最短时间'}):</strong><br>`;
    let totalDistance = 0;
    
    for (let i = 0; i < optimizedRoute.length; i++) {
        result += `${i + 1}. ${optimizedRoute[i].name} (${optimizedRoute[i].lng}, ${optimizedRoute[i].lat})<br>`;
        
        if (i > 0) {
            const distance = calculateDistance(optimizedRoute[i-1], optimizedRoute[i]);
            totalDistance += distance;
            result += `   距离: ${distance.toFixed(2)}公里<br>`;
        }
    }
    
    result += `<br>总距离: ${totalDistance.toFixed(2)}公里<br>`;
    result += `<button onclick="showOptimizedRoute('${JSON.stringify(optimizedRoute)}')" class="btn" style="margin-top: 10px;">在地图上显示</button>`;
    
    document.getElementById('optimize-result').innerHTML = result;
    showMessage('路径优化完成', 'success');
}

// 距离优化算法
function optimizeRouteByDistance(points, type) {
    if (type === 'distance') {
        // 使用最近邻算法
        const optimized = [points[0]];
        const remaining = points.slice(1);
        
        while (remaining.length > 0) {
            const current = optimized[optimized.length - 1];
            let nearestIndex = 0;
            let minDistance = Infinity;
            
            for (let i = 0; i < remaining.length; i++) {
                const distance = calculateDistance(current, remaining[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = i;
                }
            }
            
            optimized.push(remaining[nearestIndex]);
            remaining.splice(nearestIndex, 1);
        }
        
        return optimized;
    } else {
        // 时间优化（简化版，实际应该调用路线规划API）
        return points;
    }
}

// 计算两点间距离（公里）
function calculateDistance(point1, point2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 数据可视化
function visualizeData() {
    const data = document.getElementById('visual-data').value.trim();
    const visualType = document.getElementById('visual-type').value;
    
    if (!data) {
        showMessage('请输入可视化数据', 'error');
        return;
    }
    
    const dataPoints = data.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split(',');
        return {
            name: parts[0],
            lng: parseFloat(parts[1]),
            lat: parseFloat(parts[2]),
            value: parseFloat(parts[3])
        };
    });
    
    let result = `<strong>可视化数据 (${visualType}):</strong><br>`;
    dataPoints.forEach(point => {
        result += `${point.name}: ${point.value}<br>`;
    });
    
    result += `<button onclick="showVisualization('${JSON.stringify(dataPoints)}', '${visualType}')" class="btn" style="margin-top: 10px;">在地图上显示</button>`;
    
    document.getElementById('visual-result').innerHTML = result;
    showMessage('数据可视化准备完成', 'success');
}

// 在地图上显示单个点
function showOnMap(coordinates) {
    clearMap();
    const [lng, lat] = coordinates.split(',').map(Number);
    const location = new AMap.LngLat(lng, lat);
    
    const marker = new AMap.Marker({
        position: location,
        title: '转换后的坐标'
    });
    
    marker.setMap(advancedMap);
    advancedMap.setCenter(location);
    advancedMap.setZoom(15);
}

// 在地图上显示轨迹
function showTrackOnMap(coordinates) {
    clearMap();
    const coordArray = coordinates.split('|');
    const path = coordArray.map(coord => {
        const [lng, lat] = coord.split(',').map(Number);
        return new AMap.LngLat(lng, lat);
    });
    
    currentPolyline = new AMap.Polyline({
        path: path,
        strokeColor: '#FF0000',
        strokeWeight: 3,
        strokeOpacity: 0.8
    });
    
    currentPolyline.setMap(advancedMap);
    
    // 添加起点和终点标记
    const startMarker = new AMap.Marker({
        position: path[0],
        title: '起点',
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
    });
    
    const endMarker = new AMap.Marker({
        position: path[path.length - 1],
        title: '终点',
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
    });
    
    startMarker.setMap(advancedMap);
    endMarker.setMap(advancedMap);
    
    advancedMap.setFitView();
}

// 在地图上显示POI
function showPOIsOnMap(poisJson) {
    clearMap();
    const pois = JSON.parse(poisJson);
    
    pois.forEach((poi, index) => {
        const [lng, lat] = poi.location.split(',').map(Number);
        const location = new AMap.LngLat(lng, lat);
        
        const marker = new AMap.Marker({
            position: location,
            title: poi.name
        });
        
        marker.setMap(advancedMap);
        currentMarkers.push(marker);
    });
    
    advancedMap.setFitView();
}

// 在地图上显示围栏
function showFenceOnMap(fenceCoords, testPoint) {
    clearMap();
    
    const fencePoints = fenceCoords.split('\n').filter(line => line.trim()).map(line => {
        const [lng, lat] = line.split(',').map(Number);
        return new AMap.LngLat(lng, lat);
    });
    
    // 绘制围栏
    currentPolygon = new AMap.Polygon({
        path: fencePoints,
        strokeColor: '#FF0000',
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.1
    });
    
    currentPolygon.setMap(advancedMap);
    
    // 添加测试点
    const [testLng, testLat] = testPoint.split(',').map(Number);
    const testLocation = new AMap.LngLat(testLng, testLat);
    
    const testMarker = new AMap.Marker({
        position: testLocation,
        title: '测试点',
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
    });
    
    testMarker.setMap(advancedMap);
    advancedMap.setFitView();
}

// 在地图上显示优化路径
function showOptimizedRoute(routeJson) {
    clearMap();
    const route = JSON.parse(routeJson);
    
    const path = route.map(point => new AMap.LngLat(point.lng, point.lat));
    
    currentPolyline = new AMap.Polyline({
        path: path,
        strokeColor: '#00FF00',
        strokeWeight: 4,
        strokeOpacity: 0.8
    });
    
    currentPolyline.setMap(advancedMap);
    
    // 添加途经点标记
    route.forEach((point, index) => {
        const location = new AMap.LngLat(point.lng, point.lat);
        const marker = new AMap.Marker({
            position: location,
            title: `${index + 1}. ${point.name}`,
            label: {
                content: `${index + 1}`,
                direction: 'top'
            }
        });
        
        marker.setMap(advancedMap);
        currentMarkers.push(marker);
    });
    
    advancedMap.setFitView();
}

// 在地图上显示可视化
function showVisualization(dataJson, visualType) {
    clearMap();
    const dataPoints = JSON.parse(dataJson);
    
    if (visualType === 'marker') {
        dataPoints.forEach(point => {
            const location = new AMap.LngLat(point.lng, point.lat);
            const marker = new AMap.Marker({
                position: location,
                title: `${point.name}: ${point.value}`,
                label: {
                    content: point.value.toString(),
                    direction: 'top'
                }
            });
            
            marker.setMap(advancedMap);
            currentMarkers.push(marker);
        });
    } else if (visualType === 'cluster') {
        // 简单的聚合显示
        dataPoints.forEach(point => {
            const location = new AMap.LngLat(point.lng, point.lat);
            const marker = new AMap.Marker({
                position: location,
                title: point.name,
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
            });
            
            marker.setMap(advancedMap);
            currentMarkers.push(marker);
        });
    }
    
    advancedMap.setFitView();
}

// 清除地图上的所有元素
function clearMap() {
    if (currentPolyline) {
        currentPolyline.setMap(null);
        currentPolyline = null;
    }
    
    if (currentPolygon) {
        currentPolygon.setMap(null);
        currentPolygon = null;
    }
    
    currentMarkers.forEach(marker => {
        marker.setMap(null);
    });
    currentMarkers = [];
}

// 显示消息
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
} 