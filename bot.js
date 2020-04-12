console.log('bot started');
var Twit = require('twit');
var weather = require('weather-js');
var outlook = require('./outlook.json');
var feelslike = require('./feelslike.json');

var T = new Twit({
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...',
});

var recife = 'Recife, PE';
  
setInterval(normal, 1000*60*60*3);
//setInterval(previsao, 1000*60*60*24);
normal();
//previsao();

function normal(){
    procuratempo(recife, false);
}
function previsao(){
    procuratempo(recife, true);
}

function procuratempo(cidade, isForecast){
    weather.find({search: cidade, degreeType: 'C'}, function(err, result) {
        if(err) console.log(err);
        if(isForecast){
            var s = tratarForecast(result);
        }else{
            var s = tratarCurrent(result); 
        }
        tweet(s);    
    });
} 

function tweet(text){
    
    T.post('statuses/update', {status: text}, function(err, data, response) {
        if(err){
            console.log(err.message);
        }else{
            console.log("Funcionou");
            
        }    
    });
}

function tratarCurrent(text){
    var ou;
    if(outlook[text[0].current.skytext]){
        ou = outlook[text[0].current.skytext].translate + " " + outlook[text[0].current.skytext].emoji;
    }else{
        ou = text[0].current.skytext;
    }

    var temp = sensacao(parseInt(text[0].current.temperature), feelslike);
    var sens = sensacao(parseInt(text[0].current.feelslike), feelslike); 

    var mensagem = "Clima em Recife:\nTemperatura: " + text[0].current.temperature
                    +"ºC " + temp +"\nSensação Térmica: " + text[0].current.feelslike 
                    +"ºC " +sens +"\nAparência: " +  ou 
                    + "\nUmidade do ar: " + text[0].current.humidity + "%";

    return mensagem;
}

function sensacao(temp, feelslike){
    if(temp < 20)
        return feelslike["very cold"];
    if(temp >= 20 && temp <= 25)
        return feelslike["cold"];
    if(temp >25 && temp <= 28)
        return feelslike["ok"];
    if(temp >28 && temp <= 31)
        return feelslike["hot"];
    if(temp > 31)
        return feelslike["very hot"];
}


function tratarForecast(data){
    var x = forecast(data);
    var p ="0";
    if(x.precip != ''){
        p = x.precip;
    }

    var ou;
    if(outlook[x.skytextday]){
        ou = outlook[x.skytextday].translate + " " + outlook[x.skytextday].emoji;
    }else{
        ou = x.skytextday;
    }

    var msg = 'Previsão para hoje:\nMínima: ' + x.low +'ºC\n'+
                'Máxima: '+x.high+'ºC\n'+
                'Aparência: '+ ou+'\n'+
                'Chuva: ' +p+ '%';
    return msg;
}


function forecast(data){
    var today = new Date();
    var date = today.getFullYear()+'-0'+(today.getMonth()+1)+'-'+today.getDate();

    for(i=0;i<Object.keys(data[0].forecast).length;i++){
        if(data[0].forecast[i].date == date){
            return data[0].forecast[i];
        }
    }
}


