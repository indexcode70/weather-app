
const apikey = config.apikey;

// HTMLの部品を捕まえる
const locationElt = document.getElementById('location');
const tempElt = document.getElementById('temp');
const descElt = document.getElementById('description');
const iconElt = document.getElementById('weather-icon');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-button');
const rainContainer = document.getElementById('rain-container');
const sunContainer = document.getElementById('sun-container');
const cloudContainer = document.getElementById('cloud-container');
const thunderContainer = document.getElementById('thunder-container');


async function getWeather(city) {
    // 都市名の後に「,jp」を自動で付け足す(日本国内に限定される)
    // これで「東京」が「東京,jp」で検索され、制度が上がる
    const searchName = city.includes(',') ? city : `${city},jp`;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apikey}&units=metric&lang=ja`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "404") {
            descElt.innerText = "都市名が見つかりませんでした";
            return;
        }

        locationElt.innerText = data.name;
        tempElt.innerText = `${Math.round(data.main.temp)} ℃`;
        
        // 時間をチェエク(夜かどうか)
        const now = new Date();
        const hour = now.getHours();
        const isNight = hour >= 18 || hour < 6;

        descElt.innerText = data.weather[0].description + (isNight ? " (夜)" : "");

        const iconCode = data.weather[0].icon;
        iconElt.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        iconElt.alt = data.weather[0].description;

        updateBackground(data.weather[0].main, isNight);  // isNightを逃がす

    } catch (error) {
        console.error(error);
        descElt.innerText = "エラー:天気を読み込めませんでした";
    }
}

searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value;
    if (cityName) {
        getWeather(cityName);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cityName = cityInput.value;
        if (cityName) {
            getWeather(cityName);
        }
    }
});

function updateBackground(weather, isNight) {

    // 一旦クラスを外す
    document.body.classList.remove('night-mode');

    if (isNight) {
        document.body.classList.add('night-mode');
        // 夜の時は太陽のコンテナを動かさない
    }

    let bgColor = "";

    // 以前の天候をリセット
    rainContainer.classList.remove('active'); 
    rainContainer.innerHTML = "";
    sunContainer.classList.remove('active');
    sunContainer.innerHTML = ""; 
    cloudContainer.classList.remove('active');
    cloudContainer.innerHTML = "";
    thunderContainer.classList.remove('active');
    thunderContainer.innerHTML = "";


    //-----------晴れ----------
    if (weather === "Clear") {
        if (isNight) {
            bgColor = "linear-gradient(to bottom, #232526, #414345)";  // 夜の背景
            descElt.innerText += " (夜)";
            // 夜なので太陽は出さない(sunContainerをactiveにしない)
        } else {
            bgColor = "linear-gradient(to bottom, #f7b733, #fc4a1a)";
        
             // 太陽の演出を追加
            sunContainer.classList.add('active');
             // 太陽本体と光線を作成して入れる
            sunContainer.innerHTML = `
            <div class="sun-rays"></div>
            <div class="sun"></div>
            `;
        }

    //----------くもり----------
    } else if (weather === "Clouds") {
        bgColor = "linear-gradient(to bottom, #bdc3c7, #2c3e50)"; 

        cloudContainer.classList.add('active');

        // 8つの雲をランダムで作る
        for (let i = 0; i < 12; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';

        // 雲事に高さ(top)や速さ、大きさをバラバラにする
        cloud.style.top = Math.random() * 60 + '%';  

        // 遠くの雲と近くの雲をランダムに作る
        const isFar = Math.random() > 0.5; // 50%の確率で遠くの雲にする

        if (isFar) {
            // 遠くの雲(小さく、薄く、ゆっくり)
            cloud.style.transform = `scale(${Math.random() * 0.4 + 0.4})`;
            cloud.style.opacity = Math.random() * 0.2 + 0.2;
            cloud.style.animationDuration = Math.random() * 20 + 50 + 's';
            cloud.style.zIndex = "0";

        } else {
            // 近くの雲(大きく、濃く、少し速い)
        cloud.style.transform = `scale(${Math.random() * 0.4 + 0.4})`;
        cloud.style.opacity = Math.random() * 0.3 + 0.5; // 透明度をランダムにする
        cloud.style.animationDuration = Math.random() * 15 + 25 + 's';  // 25~48秒 
        cloud.style.zIndex = "1";
        }

        // 出現タイミングをバラバラにして「列」を増やす
        cloud.style.animationDelay = Math.random() * 30 + 's';

        // 最初の2個くらいはすぐに出す
        if (i< 2) {
            cloud.style.animationDelay = '0s';
            }

        cloudContainer.appendChild(cloud);
        }



    //----------雨----------
    } else if (weather === "Rain") {
        bgColor = "linear-gradient(to bottom, #4b6cb7, #182848)"; 

        // 雨を降らせる演出
        rainContainer.classList.add('active');
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = Math.random() * 0.5 + 0.5 + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            rainContainer.appendChild(drop);
        }
   
    
    //----------雪-----------
   } else if (weather === "Snow") {
        bgColor = "linear-gradient(to bottom, #cfd9df, #a1c4fd)";
        rainContainer.classList.add('active');

        for (let i = 0; i < 50; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow'; // CSSで設定した　snow クラス
            flake.style.left = Math.random() * 100 + '%';
            flake.style.width = flake.style.height = Math.random() * 5 + 5 + 'px';  // 大きさバラバラ
            flake.style.animationDuration = Math.random() * 3 + 4 + 's'; //ゆっくり降る
            flake.style.animationDelay = Math.random() * 5 + 's';
            rainContainer.appendChild(flake);
        }

    //----------雷-----------

    } else if (weather === "Thunderstorm") {
        bgColor = "linear-gradient(to bottom, #1e130c, #9a8478)";  //こわい雰囲気の色
        thunderContainer.classList.add('active');

        rainContainer.classList.add('active'); // 雨用コンテナも使う
        for (let i = 0; i < 70; i++) { // 雷の時は少し多めの70個
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + '%';
            // 雷の時は少し速めに降らせて迫力を出す
            drop.style.animationDuration = Math.random() * 0.3 + 0.3 + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            rainContainer.appendChild(drop);
            }
        
     } else {
        bgColor = "linear-gradient(to bottom, #6dd5ed, #2193b0)"; 
    }
    
    document.body.style.background = bgColor;
}

// 最初に東京の天気を出す
getWeather("東京");
