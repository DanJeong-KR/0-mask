import React, { Component } from "react";
import { RenderAfterNavermapsLoaded, NaverMap } from "react-naver-maps";

export default class Main extends Component {
  componentDidMount() {
    console.log("componentDidMount");
  }
  render() {
    return (
      <div className="App">
        <RenderAfterNavermapsLoaded
          ncpClientId={"fs0aqkdq7k"} // 자신의 네이버 계정에서 발급받은 Client ID
          error={<p>Maps Load Error</p>}
          loading={<p>Maps Loading...</p>}
        >
          <NaverMap
            mapDivId={"react-naver-map"} // default: react-naver-map
            style={{
              width: "100%", // 네이버지도 가로 길이
              height: "85vh" // 네이버지도 세로 길이
            }}
            defaultCenter={{ lat: 37.554722, lng: 126.970833 }} // 지도 초기 위치
            defaultZoom={13} // 지도 초기 확대 배율
          />
        </RenderAfterNavermapsLoaded>
      </div>
    );
  }
}
