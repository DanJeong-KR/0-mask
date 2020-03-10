import React, { Component } from "react";
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from "react-naver-maps";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.naverMaps = window.naver.maps;

    this.state = {
      center: {
        lat: 37.42829747263545,
        lng: 126.76620435615891
      }
    };
  }

  componentDidMount() {
    console.log("componentDidMount");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        function(error) {
          console.error(error);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity
        }
      );
    } else {
      alert("GPS를 지원하지 않습니다");
    }
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
  }

  setMap = () => {};

  render() {
    console.log(111, "ddd", this.state);
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
            center={this.state.center}
            defaultZoom={16} // 지도 초기 확대 배율
          >
            <Marker
              position={this.state.center}
              animation={this.naverMaps.Animation.DROP}
              onClick={() => {
                alert("현재 위치");
              }}
            />
          </NaverMap>
        </RenderAfterNavermapsLoaded>
      </div>
    );
  }
}
