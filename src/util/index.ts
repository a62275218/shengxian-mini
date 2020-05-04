const baseUrl = "https://freshgo123.com/api/public/api/v1/";

export function formatDate(input: string | number) {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
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
  const { loading } = param;
  return new Promise((resolve, reject) => {
    if (loading) {
      uni.showLoading();
    }
    try {
      uni.request({
        url: baseUrl + url,
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
            resolve(getIn(res, "data", "data") || res.data);
          } else {
            if (param && param.errorMsg) {
              uni.showToast({
                title: param.errorMsg,
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