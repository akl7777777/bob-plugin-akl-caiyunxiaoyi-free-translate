var config = require('./config.js');
var utils = require('./utils.js');


/*
https://interpreter.cyapi.cn/v1/translator

{
    "source": "API reference documentation\nThe API reference documentation provides detailed information about a function or object in Node.js. This documentation indicates what arguments a method accepts, the return value of that method, and what errors may be related to that method. It also indicates which methods are available for different versions of Node.js.\n\nThis documentation describes the built-in modules provided by Node.js. It does not document modules provided by the community.",
    "detect": true,
    "os_type": "ios",
    "device_id": "F1F902F7-1780-4C88-848D-71F35D88A602",
    "trans_type": "en2zh",
    "media": "text",
    "request_id": 424238335,
    "user_id": "",
    "dict": true
}

{
    "isdict": 0,
    "confidence": 0.8,
    "target": "API 参考文档 API 参考文档提供了 Node.js 中函数或对象的详细信息。此文档指示方法接受哪些参数、该方法的返回值以及可能与该方法相关的错误。它还指出哪些方法可用于不同版本的 Node.js。本文档描述了 Node.js 提供的内置模块。它不记录社区提供的模块。",
    "rc": 0
}

Content-Type:application/json
x-authorization:token ssdj273ksdiwi923bsd9
user-agent:caiyunInterpreter/5 CFNetwork/1404.0.5 Darwin/22.3.0
*/
function init_data(source_lang, target_lang) {
  return {
    "source": "",
    "detect": true,
    "os_type": "ios",
    "device_id": "F1F902F7-1780-4C88-848D-71F35D88A602",
    "trans_type": source_lang + '2' + target_lang,
    "media": "text",
    "request_id": 424238335,
    "user_id": "",
    "dict": true
  };
}

function getRandomNumber() {
  const rand = Math.floor(Math.random() * 99999) + 100000;
  return rand * 1000;
}

function supportLanguages() {
  return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function translate(query, completion) {
  (async () => {
    const targetLanguage = utils.langMap.get(query.detectTo);
    const sourceLanguage = utils.langMap.get(query.detectFrom);
    if (!targetLanguage) {
      const err = new Error();
      Object.assign(err, {
        _type: 'unsupportLanguage',
        _message: '不支持该语种',
      });
      throw err;
    }
    const source_lang = sourceLanguage || 'ZH';
    const target_lang = targetLanguage || 'EN';
    const translate_text = query.text || '';
    let response;
    if (translate_text !== '') {
      const url = 'https://interpreter.cyapi.cn/v1/translator';
      id = getRandomNumber()
      const post_data = init_data(source_lang, target_lang)
      post_data.source = translate_text
      post_data.request_id = getRandomNumber()
      try {
        $http.request({
          method: "POST",
          url: url,
          header: {
            'Content-Type': 'application/json',
            'x-authorization': 'token ssdj273ksdiwi923bsd9',
            'user-agent': 'caiyunInterpreter/5 CFNetwork/1404.0.5 Darwin/22.3.0'
          },
          body: post_data,
          handler: function (resp) {
            if (resp.data && resp.data.target) {
              completion({
                result: {
                  from: query.detectFrom,
                  to: query.detectTo,
                  toParagraphs: resp.data.target.split('\n'),
                },
              });
            } else {
              const errMsg = resp.data ? JSON.stringify(resp.data) : '未知错误'
              completion({
                error: {
                  type: 'unknown',
                  message: errMsg,
                  addtion: errMsg,
                },
              });
            }
          }
        });
      }
      catch (e) {
        Object.assign(e, {
          _type: 'network',
          _message: '接口请求错误 - ' + JSON.stringify(e),
        });
        throw e;
      }
    }
  })().catch((err) => {
    completion({
      error: {
        type: err._type || 'unknown',
        message: err._message || '未知错误',
        addtion: err._addtion,
      },
    });
  });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
