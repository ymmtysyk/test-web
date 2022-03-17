// Prediction OneのAPI作成画面で表示されるAPI URLとAPI Keyを設定する
const PREDICTION_ONE_KEY = "23e4d37a-0484-45aa-bb05-b751a5ece92b";
const PREDICTION_ONE_URL = "https://user-api.predictionone.sony.biz/v1/groups/gbe5y8ebdzumtqko/classifiers/213n14b4auiw1v14/inference";



// APIが受け付けているデータ形式に変換する
function b64Decode(str) {
    const encodedURI = atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
    const result = decodeURIComponent(encodedURI);
    return result;
}
function b64Encode(str) {
    const stringToEncode = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    })
    const result = btoa(stringToEncode);
    return result;
}
// APIにデータを送信する
async function postData(url = '', data = {}, key ) {
    
    hoge = await fetch(url, {
        method: 'POST',
        mode: 'cors', 
        headers: {
            'Content-Type': 'application/json',
            "x-api-key": key,
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
    .then(data => {
        return  b64Decode( data.outputs[0].data) 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    return hoge;
}

async function predict(pred_data, preidcion_one_url, key  ){

    const url = preidcion_one_url;
    // APIへの送信内容を整える
    const data = 
            {"inputs":
                [
                    {"name":"pr","type":"csv","data": b64Encode(pred_data)},
                    {"name":"ar","type":"boolean","data":true},
                    {"name":"ad","type":"boolean","data":false},
                    {"name":"nc","type":"boolean","data":true}]
                }
        return await postData(url,data,key);
}

// APIから取得したデータからリスクを評価する
function evaluation_risk_by_score(score){  
    let result_text = "";
    let result_class = "";
    if( score <= 0 ){
        result_text = "リスク低";
        result_class = "low";
    }else if ( score > 0 && score <= 30 ){
        result_text = "リスク中";
        result_class = "middle";
    }else{
        result_text = "リスク高";
        result_class = "high";
    }
    return { "text": result_text, "class": result_class};
}

// 送信ボタンが押された時の処理
submit = async function(){
    document.querySelector("#result").innerText = "予測中";
    document.querySelector( "#submit" ).disabled = true
    document.querySelector("#result").className ="";
    
    const selects = document.querySelectorAll("select");
    const data = [ [],[] ];
    selects.forEach( elm =>{
        data[ 0 ].push( elm.name );
        data[ 1 ].push(elm.value);
    } );
    const data_str = data[0].join(",") + "\n" + data[1].join(",");
    
    const result = await predict( data_str, PREDICTION_ONE_URL, PREDICTION_ONE_KEY ) ;
    const score = result.split( "\n" )[1].split(",")[1];
    const evaluation  = evaluation_risk_by_score(score);
    document.querySelector("#result").innerText = evaluation["text"] + "(" +  score + ")";
    document.querySelector("#result").className = evaluation["class"];
    document.querySelector( "#submit" ).disabled = false;
}