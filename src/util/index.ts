import store from "../store";

export function formatDate(input: string | number, includeTime) {
  if (typeof (input) == 'string' && input.indexOf('-') > -1) {
    input = input.replace(new RegExp('-', 'g'), '/');
  }
  if(typeof input === 'number' && String(input).length < 13){
    input = input * 1000
  }
  const date = new Date(input);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )} ${includeTime && hour + ":" + String(minute).padStart(2, "0") || ''}`;
}

export function getIn(obj: any, ...restParams: any) {
  if (typeof obj === "undefined") {
    return null;
  }
  const validateObj = (object: any, key: any) => {
    return ["undefined"].indexOf(typeof object[key]) === -1
      ? object[key]
      : null;
  };
  const paramLen = restParams.length;
  let currentIndex = 0,
    currentVal = validateObj(obj, restParams[currentIndex]);
  if (!restParams.length) {
    return obj;
  }

  while (currentVal !== null) {
    // 如果已经是最后一层结构，直接返回
    if (currentIndex === paramLen - 1) {
      return currentVal;
    }
    // 如果不是最后一层且值存在，进行深层判断
    if (currentVal !== null) {
      currentIndex++;
      currentVal = validateObj(currentVal, restParams[currentIndex]);
    } else {
      return null;
    }
  }
}

export interface IRequestParam {
  data: object;
  loading?: boolean;
  method?:
    | "POST"
    | "OPTIONS"
    | "GET"
    | "HEAD"
    | "PUT"
    | "DELETE"
    | "TRACE"
    | "CONNECT"
    | undefined;
  successMsg?: string;
  errorMsg?: string;
}

export function request(url: string, param: IRequestParam) {
  const { state } = store;
  const { loading } = param;
  return new Promise((resolve, reject) => {
    if (loading) {
      uni.showLoading();
    }
    try {
      uni.request({
        url: state.baseUrl + url,
        method: param ? param.method || "POST" : "POST",
        ...param,
        success(res) {
          const code = getIn(res, "data", "code");
          uni.hideLoading();
          if (code === 0) {
            if (param && param.successMsg) {
              uni.showToast({
                title: param.successMsg,
                icon: "none",
              });
            }
            const data = getIn(res, "data", "data");
            resolve(getIn(res, "data", "data") === undefined ? res.data : data);
          } else {
            const errorMsg = getIn(res, "data", "errMsg");
            console.log(errorMsg)
            if (param && param.errorMsg) {
              uni.showToast({
                title: param.errorMsg,
                icon: "none",
              });
            }else if(errorMsg){
              uni.showToast({
                title: errorMsg,
                icon: "none",
              });
            }
            resolve("");
          }
        },
        fail(err) {
          uni.hideLoading();
          console.log("request fail:");
          uni.showToast({
            title: "服务器错误",
            icon: "none",
          });
          resolve("");
        },
      });
    } catch (err) {
      console.log("catched errro");
      console.log(err);
      uni.hideLoading();
      uni.showToast({
        title: "服务器错误",
        icon: "none",
      });
      resolve("");
    }
  });
}

export function formatPhoneNumber(phone, area) {
  const returnPhone = phone.startsWith("0") ? phone.substr(1) : phone;
  return area + returnPhone;
}

export function debounce(func, wait) {
  let timer;
  return function() {
    let _this = this; // 注意 this 指向
    let args = arguments; // arguments中存着e

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(_this, args);
    }, wait);
  };
}
export function throttle(func, wait) {
  let _this = this;
  let args = arguments;
  let previous = 0;
  return function() {
    let now = Date.now();
    console.log("now", now);
    console.log("previous", previous);
    console.log("gap", now - previous);
    if (now - previous > wait) {
      console.log("wait");
      func.apply(_this, args);
      previous = now;
    }
  };
}

export function checkBill(result) {
  if (result) {
    if (result.errMsg) {
      uni.showToast({
        title: "您已被禁用",
        icon: "none",
      });
      return false;
    }
    let failReason = "";
    if (Object.prototype.toString.call(result) === "[object Array]") {
      result.forEach((res) => {
        if (res.reason !== "OK") {
          failReason = `${res.title}${res.reason}`;
        }
      });
    }
    if (failReason) {
      uni.showToast({
        title: failReason,
        icon: "none",
      });
      return false;
    }
    return result;
  } else {
    uni.showToast({
      title: "检查订单失败",
      icon: "none",
    });
    return false;
  }
}
