// 全局变量
let map;
let geocoder;
let driving;
let walking;
let transit;
let weather;
let placeSearch;
let autocomplete;
let currentPosition = null;

// API Key
const API_KEY = 'ce54301973a263c142c2e5aa8b19ebee';

// 调试函数
function showDebug(message) {
    console.log(message);
    const debug = document.getElementById('debug');
    const debugInfo = document.getElementById('debugInfo');
    if (debug && debugInfo) {
        debug.style.display = 'block';
        debugInfo.innerHTML = message;
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.minWidth = '200px';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
    
    showDebug(`消息: ${message} (${type})`);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    showDebug('开始初始化应用...');
    
    // 延迟初始化，确保高德地图API加载完成
    setTimeout(() => {
        initMap();
        initServices();
        setupEventListeners();
        showDebug('应用初始化完成');
    }, 1000);
});

// 初始化地图
function initMap() {
    try {
        showDebug('初始化地图...');
        
        if (typeof AMap === 'undefined') {
            showDebug('高德地图API未加载，等待重试...');
            setTimeout(initMap, 1000);
            return;
        }
        
        map = new AMap.Map('map', {
            zoom: 11,
            center: [116.397428, 39.90923], // 北京
            mapStyle: 'amap://styles/normal'
        });
        
        // 添加地图控件
        map.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
        });
        
        showDebug('地图初始化成功');
    } catch (error) {
        showDebug(`地图初始化失败: ${error.message}`);
        showMessage('地图初始化失败，请检查网络连接', 'error');
    }
}

// 初始化服务
function initServices() {
    try {
        showDebug('初始化服务...');
        
        if (typeof AMap === 'undefined') {
            showDebug('高德地图API未加载，跳过服务初始化');
            return;
        }
        
        // 地理编码服务
        geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
        });
        
        // 路线规划服务
        driving = new AMap.Driving({
            map: map,
            policy: AMap.DrivingPolicy.LEAST_TIME
        });
        
        walking = new AMap.Walking({
            map: map
        });
        
        transit = new AMap.Transit({
            map: map,
            policy: AMap.TransitPolicy.LEAST_TIME
        });
        
        // 天气服务
        weather = new AMap.Weather();
        
        // POI搜索服务
        placeSearch = new AMap.PlaceSearch({
            pageSize: 20,
            pageIndex: 1,
            city: "全国"
        });
        
        // 输入提示服务
        try {
            autocomplete = new AMap.Autocomplete({
                input: "startPoint"
            });
            
            new AMap.Autocomplete({
                input: "endPoint"
            });
        } catch (e) {
            showDebug('输入提示服务初始化失败，但不影响主要功能');
        }
        
        showDebug('服务初始化成功');
    } catch (error) {
        showDebug(`服务初始化失败: ${error.message}`);
    }
}

// 设置事件监听器
function setupEventListeners() {
    showDebug('设置事件监听器...');
    
    // 回车键搜索
    const inputs = ['startPoint', 'endPoint', 'poiKeyword', 'weatherCity'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const btnId = id === 'startPoint' ? 'startBtn' : 
                                 id === 'endPoint' ? 'endBtn' : 
                                 id === 'poiKeyword' ? 'poiBtn' : 'weatherBtn';
                    const btn = document.getElementById(btnId);
                    if (btn) btn.click();
                }
            });
        }
    });
    
    showDebug('事件监听器设置完成');
}

// 地理编码地址
function geocodeAddress(type) {
    showDebug(`开始地理编码: ${type}`);
    
    const input = document.getElementById(type === 'start' ? 'startPoint' : 'endPoint');
    const address = input.value.trim();
    
    if (!address) {
        showMessage('请输入地址', 'error');
        return;
    }
    
    if (!geocoder) {
        showMessage('地理编码服务未初始化', 'error');
        return;
    }
    
    showMessage('正在解析地址...', 'info');
    
    geocoder.getLocation(address, function(status, result) {
        if (status === 'complete' && result.geocodes.length) {
            const location = result.geocodes[0].location;
            const formattedAddress = result.geocodes[0].formattedAddress;
            
            // 在地图上添加标记
            addMarker(location, type, formattedAddress);
            
            // 保存位置信息
            if (type === 'start') {
                window.startLocation = location;
            } else {
                window.endLocation = location;
            }
            
            showMessage(`成功定位: ${formattedAddress}`, 'success');
            
            // 居中显示
            map.setCenter(location);
            map.setZoom(15);
        } else {
            showMessage('地址解析失败，请检查地址是否正确', 'error');
        }
    });
}

// 添加地图标记
function addMarker(location, type, title) {
    try {
        const marker = new AMap.Marker({
            position: location,
            title: title,
            icon: type === 'start' ? 
                'https://webapi.amap.com/theme/v1.3/markers/n/start.png' : 
                'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
        });
        
        marker.setMap(map);
        
        // 添加信息窗体
        const infoWindow = new AMap.InfoWindow({
            content: `<div style="padding: 10px;">
                        <h4>${type === 'start' ? '起点' : '终点'}</h4>
                        <p>${title}</p>
                        <p>经度: ${location.lng}</p>
                        <p>纬度: ${location.lat}</p>
                      </div>`
        });
        
        marker.on('click', function() {
            infoWindow.open(map, location);
        });
        
        showDebug(`标记添加成功: ${title}`);
    } catch (error) {
        showDebug(`添加标记失败: ${error.message}`);
    }
}

// 路线规划
function planRoute() {
    showDebug('开始路线规划');
    
    if (!window.startLocation || !window.endLocation) {
        showMessage('请先设置起点和终点', 'error');
        return;
    }
    
    const routeType = document.getElementById('routeType').value;
    showMessage('正在规划路线...', 'info');
    
    // 清除之前的路线
    map.clearMap();
    
    // 重新添加起点和终点标记
    addMarker(window.startLocation, 'start', '起点');
    addMarker(window.endLocation, 'end', '终点');
    
    let routeService;
    switch (routeType) {
        case 'driving':
            routeService = driving;
            break;
        case 'walking':
            routeService = walking;
            break;
        case 'transit':
            routeService = transit;
            break;
    }
    
    if (!routeService) {
        showMessage('路线规划服务未初始化', 'error');
        return;
    }
    
    routeService.search(window.startLocation, window.endLocation, function(status, result) {
        if (status === 'complete') {
            displayRouteInfo(result, routeType);
            showMessage('路线规划完成', 'success');
        } else {
            showMessage('路线规划失败', 'error');
        }
    });
}

// 显示路线信息
function displayRouteInfo(result, type) {
    const routeInfo = document.getElementById('routeInfo');
    let html = '';
    
    if (type === 'transit') {
        result.routes.forEach((route, index) => {
            html += `<div class="route-item">
                        <h5>方案 ${index + 1}</h5>
                        <p><strong>总时间:</strong> ${route.time}分钟</p>
                        <p><strong>总距离:</strong> ${route.distance}米</p>
                        <p><strong>费用:</strong> ${route.cost}元</p>
                        <p><strong>步行距离:</strong> ${route.walking_distance}米</p>
                    </div>`;
        });
    } else {
        const route = result.routes[0];
        html = `<div class="route-item">
                    <h5>${type === 'driving' ? '驾车' : '步行'}路线</h5>
                    <p><strong>总时间:</strong> ${route.time}分钟</p>
                    <p><strong>总距离:</strong> ${route.distance}米</p>
                    <p><strong>起点:</strong> ${route.origin}</p>
                    <p><strong>终点:</strong> ${route.destination}</p>
                </div>`;
    }
    
    routeInfo.innerHTML = html;
    showTab('route');
}

// POI搜索
function searchPOI() {
    showDebug('开始POI搜索');
    
    const keyword = document.getElementById('poiKeyword').value.trim();
    const type = document.getElementById('poiType').value;
    
    if (!keyword) {
        showMessage('请输入搜索关键词', 'error');
        return;
    }
    
    if (!placeSearch) {
        showMessage('POI搜索服务未初始化', 'error');
        return;
    }
    
    showMessage('正在搜索POI...', 'info');
    
    const searchOptions = {
        keyword: keyword,
        city: '全国'
    };
    
    if (type) {
        searchOptions.type = type;
    }
    
    // 如果有当前位置，优先搜索周边
    if (currentPosition) {
        searchOptions.location = currentPosition;
        searchOptions.radius = 5000; // 5公里范围内
    }
    
    placeSearch.search(keyword, function(status, result) {
        if (status === 'complete' && result.poiList.pois.length) {
            displayPOIResults(result.poiList.pois);
            showMessage(`找到 ${result.poiList.pois.length} 个结果`, 'success');
        } else {
            showMessage('未找到相关POI', 'info');
        }
    });
}

// 显示POI搜索结果
function displayPOIResults(pois) {
    const poiResults = document.getElementById('poiResults');
    let html = '';
    
    pois.forEach(poi => {
        html += `<div class="poi-item" onclick="showPOIOnMap(${poi.location.lng}, ${poi.location.lat}, '${poi.name}')">
                    <h5>${poi.name}</h5>
                    <p><strong>地址:</strong> ${poi.address}</p>
                    <p><strong>类型:</strong> ${poi.type}</p>
                    <p><strong>距离:</strong> ${poi.distance ? poi.distance + '米' : '未知'}</p>
                    <p><strong>电话:</strong> ${poi.tel || '暂无'}</p>
                </div>`;
    });
    
    poiResults.innerHTML = html;
    showTab('poi');
}

// 在地图上显示POI
function showPOIOnMap(lng, lat, name) {
    const location = new AMap.LngLat(lng, lat);
    
    // 清除之前的POI标记
    map.clearMap();
    
    // 添加POI标记
    const marker = new AMap.Marker({
        position: location,
        title: name
    });
    
    marker.setMap(map);
    
    // 添加信息窗体
    const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding: 10px;">
                    <h4>${name}</h4>
                    <p>经度: ${lng}</p>
                    <p>纬度: ${lat}</p>
                  </div>`
    });
    
    infoWindow.open(map, location);
    
    // 居中显示
    map.setCenter(location);
    map.setZoom(15);
}

// 天气查询
function getWeather() {
    showDebug('开始天气查询');
    
    const city = document.getElementById('weatherCity').value.trim();
    
    if (!city) {
        showMessage('请输入城市名称', 'error');
        return;
    }
    
    if (!weather) {
        showMessage('天气服务未初始化', 'error');
        return;
    }
    
    showMessage('正在查询天气...', 'info');
    
    // 查询实时天气
    weather.getLive(city, function(err, data) {
        if (!err) {
            displayWeatherInfo(data, city);
            showMessage('天气信息获取成功', 'success');
        } else {
            showMessage('天气信息获取失败', 'error');
        }
    });
    
    // 查询天气预报
    weather.getForecast(city, function(err, data) {
        if (!err) {
            displayWeatherForecast(data, city);
        }
    });
}

// 显示天气信息
function displayWeatherInfo(data, city) {
    const weatherInfo = document.getElementById('weatherInfo');
    let html = `<div class="weather-card">
                    <h5>${city} - 实时天气</h5>
                    <div class="weather-info">
                        <div class="weather-item">
                            <span>温度</span>
                            <strong>${data.temperature}°C</strong>
                        </div>
                        <div class="weather-item">
                            <span>天气</span>
                            <strong>${data.weather}</strong>
                        </div>
                        <div class="weather-item">
                            <span>湿度</span>
                            <strong>${data.humidity}%</strong>
                        </div>
                        <div class="weather-item">
                            <span>风向</span>
                            <strong>${data.windDirection}</strong>
                        </div>
                        <div class="weather-item">
                            <span>风力</span>
                            <strong>${data.windPower}级</strong>
                        </div>
                        <div class="weather-item">
                            <span>发布时间</span>
                            <strong>${data.reportTime}</strong>
                        </div>
                    </div>
                </div>`;
    
    weatherInfo.innerHTML = html;
    showTab('weather');
}

// 显示天气预报
function displayWeatherForecast(data, city) {
    const weatherInfo = document.getElementById('weatherInfo');
    let html = weatherInfo.innerHTML;
    
    html += `<div class="weather-card">
                <h5>${city} - 天气预报</h5>`;
    
    data.forecasts.forEach(forecast => {
        html += `<div class="weather-item">
                    <span>${forecast.date}</span>
                    <strong>${forecast.dayWeather}</strong>
                    <span>${forecast.dayTemp}°C / ${forecast.nightTemp}°C</span>
                </div>`;
    });
    
    html += '</div>';
    weatherInfo.innerHTML = html;
}

// 获取行政区域信息
function getDistrictInfo() {
    showDebug('开始查询行政区域信息');
    
    const districtName = document.getElementById('districtName').value.trim();
    
    if (!districtName) {
        showMessage('请输入地区名称', 'error');
        return;
    }
    
    showMessage('正在查询区域信息...', 'info');
    
    // 使用高德地图Web服务API
    fetch(`https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(districtName)}&subdistrict=1&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.districts.length) {
                displayDistrictInfo(data.districts[0]);
                showMessage('区域信息获取成功', 'success');
            } else {
                showMessage('未找到相关区域信息', 'info');
            }
        })
        .catch(error => {
            showMessage('区域信息获取失败', 'error');
        });
}

// 显示行政区域信息
function displayDistrictInfo(district) {
    const trafficInfo = document.getElementById('trafficInfo');
    let html = `<div class="traffic-item">
                    <h5>${district.name} - 行政区域信息</h5>
                    <p><strong>级别:</strong> ${district.level}</p>
                    <p><strong>编码:</strong> ${district.adcode}</p>
                    <p><strong>中心点:</strong> ${district.center}</p>
                    <p><strong>边界:</strong> ${district.boundaries ? '有边界数据' : '无边界数据'}</p>
                </div>`;
    
    if (district.districts && district.districts.length) {
        html += `<div class="traffic-item">
                    <h5>下级区域</h5>`;
        district.districts.forEach(subDistrict => {
            html += `<p>• ${subDistrict.name} (${subDistrict.level})</p>`;
        });
        html += '</div>';
    }
    
    trafficInfo.innerHTML = html;
    showTab('traffic');
}

// 获取交通信息
function getTrafficInfo() {
    showDebug('开始获取交通信息');
    
    if (!currentPosition) {
        showMessage('请先获取当前位置', 'error');
        return;
    }
    
    showMessage('正在获取交通信息...', 'info');
    
    // 获取路况信息
    fetch(`https://restapi.amap.com/v3/traffic/status/rectangle?level=4&rectangle=${currentPosition.lng-0.01},${currentPosition.lat-0.01};${currentPosition.lng+0.01},${currentPosition.lat+0.01}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                displayTrafficInfo(data);
                showMessage('交通信息获取成功', 'success');
            } else {
                showMessage('交通信息获取失败', 'error');
            }
        })
        .catch(error => {
            showMessage('交通信息获取失败', 'error');
        });
}

// 显示交通信息
function displayTrafficInfo(data) {
    const trafficInfo = document.getElementById('trafficInfo');
    let html = `<div class="traffic-item">
                    <h5>当前区域交通状况</h5>
                    <p><strong>评估时间:</strong> ${data.evaluation.time}</p>
                    <p><strong>状态描述:</strong> ${data.evaluation.status}</p>
                    <p><strong>拥堵指数:</strong> ${data.evaluation.expedite}</p>
                </div>`;
    
    if (data.trafficinfo && data.trafficinfo.length) {
        html += `<div class="traffic-item">
                    <h5>详细路况</h5>`;
        data.trafficinfo.forEach(info => {
            html += `<p>• ${info.name}: ${info.status}</p>`;
        });
        html += '</div>';
    }
    
    trafficInfo.innerHTML = html;
    showTab('traffic');
}

// 获取公交信息
function getBusInfo() {
    showDebug('开始获取公交信息');
    
    if (!currentPosition) {
        showMessage('请先获取当前位置', 'error');
        return;
    }
    
    showMessage('正在获取公交信息...', 'info');
    
    // 获取周边公交站点
    fetch(`https://restapi.amap.com/v3/place/around?location=${currentPosition.lng},${currentPosition.lat}&keywords=公交站&types=交通设施服务&radius=1000&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.pois.length) {
                displayBusInfo(data.pois);
                showMessage('公交信息获取成功', 'success');
            } else {
                showMessage('未找到附近公交站点', 'info');
            }
        })
        .catch(error => {
            showMessage('公交信息获取失败', 'error');
        });
}

// 显示公交信息
function displayBusInfo(pois) {
    const trafficInfo = document.getElementById('trafficInfo');
    let html = `<div class="traffic-item">
                    <h5>附近公交站点</h5>`;
    
    pois.forEach(poi => {
        html += `<p>• ${poi.name} (距离: ${poi.distance}米)</p>`;
    });
    
    html += '</div>';
    trafficInfo.innerHTML = html;
    showTab('traffic');
}

// IP定位
function getIPLocation() {
    showDebug('开始IP定位');
    
    showMessage('正在获取当前位置...', 'info');
    
    fetch(`https://restapi.amap.com/v3/ip?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                currentPosition = new AMap.LngLat(parseFloat(data.rectangle.split(';')[0].split(',')[0]), 
                                                 parseFloat(data.rectangle.split(';')[0].split(',')[1]));
                
                // 在地图上标记当前位置
                const marker = new AMap.Marker({
                    position: currentPosition,
                    title: '当前位置',
                    icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
                });
                
                marker.setMap(map);
                map.setCenter(currentPosition);
                map.setZoom(15);
                
                showMessage(`当前位置: ${data.city}`, 'success');
            } else {
                showMessage('IP定位失败', 'error');
            }
        })
        .catch(error => {
            showMessage('IP定位失败', 'error');
        });
}

// 显示/隐藏标签页
function showTab(tabName) {
    showDebug(`切换到标签页: ${tabName}`);
    
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有标签按钮的active类
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
}

// 全局函数，供HTML调用
window.geocodeAddress = geocodeAddress;
window.planRoute = planRoute;
window.searchPOI = searchPOI;
window.getWeather = getWeather;
window.getDistrictInfo = getDistrictInfo;
window.getTrafficInfo = getTrafficInfo;
window.getBusInfo = getBusInfo;
window.getIPLocation = getIPLocation;
window.showTab = showTab;
window.showPOIOnMap = showPOIOnMap; 