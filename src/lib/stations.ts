export interface Station {
  id: string;
  name: string;
  timeFromStart: number; // cumulative minutes from Tokyo
}

export const CHUO_LINE_STATIONS: Station[] = [
  { id: "1", name: "東京", timeFromStart: 0 },
  { id: "2", name: "神田", timeFromStart: 2 },
  { id: "3", name: "御茶ノ水", timeFromStart: 4 },
  { id: "4", name: "四ツ谷", timeFromStart: 9 },
  { id: "5", name: "新宿", timeFromStart: 14 },
  { id: "6", name: "中野", timeFromStart: 19 },
  { id: "7", name: "高円寺", timeFromStart: 21 },
  { id: "8", name: "阿佐ケ谷", timeFromStart: 23 },
  { id: "9", name: "荻窪", timeFromStart: 25 },
  { id: "10", name: "西荻窪", timeFromStart: 27 },
  { id: "11", name: "吉祥寺", timeFromStart: 30 },
  { id: "12", name: "三鷹", timeFromStart: 33 },
  { id: "13", name: "武蔵境", timeFromStart: 36 },
  { id: "14", name: "東小金井", timeFromStart: 39 },
  { id: "15", name: "武蔵小金井", timeFromStart: 42 },
  { id: "16", name: "国分寺", timeFromStart: 45 },
  { id: "17", name: "西国分寺", timeFromStart: 48 },
  { id: "18", name: "国立", timeFromStart: 51 },
  { id: "19", name: "立川", timeFromStart: 55 },
  { id: "20", name: "日野", timeFromStart: 59 },
  { id: "21", name: "豊田", timeFromStart: 62 },
  { id: "22", name: "八王子", timeFromStart: 67 },
  { id: "23", name: "西八王子", timeFromStart: 70 },
  { id: "24", name: "高尾", timeFromStart: 74 },
];
