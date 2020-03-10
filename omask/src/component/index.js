import React, { Component } from "react";
import {
  RenderAfterNavermapsLoaded,
  NaverMap,
  Marker,
  Circle
} from "react-naver-maps";
import * as request from "./httpRequest";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.naverMaps = window.naver.maps;

    this.state = {
      searchValue: "",
      center: {
        lat: 37.49792,
        lng: 127.02757
      },
      storeDatas: [],
      radius: 500
    };
  }

  getData = async () => {
    const { lat, lng } = this.state.center;
    const res = await request.getStoreData({
      lat,
      lng,
      m: 500
    });
    const json = await res.json();
    this.setState({
      storeDatas: json.stores
    });
    console.log(json);
  };

  componentDidMount() {
    console.log("componentDidMount");
    this.getData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState(
            {
              center: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            },
            this.getData
          );
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

  handleInputChange = e => {
    console.log(111, "handleInputChange");
    // this.setState({
    //   [target.name]: e.target.value
    // });
  };

  render() {
    console.log(111, "ddd", this.state);
    return (
      <div className="App">
        <input
          type="text"
          name="searchValue"
          value={this.state.searchValue}
          onChange={this.handleInputChange}
          placeholder="search bar"
          style={{
            width: "100%",
            height: "100px"
          }}
        />
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
            <Circle
              center={this.state.center}
              radius={this.state.radius}
              fillOpacity={0.2}
              fillColor={"#A5E124"}
              strokeColor={"#A5E124"}
              clickable={false}
            />

            {this.state.storeDatas &&
              this.state.storeDatas.map((element, index) => {
                const { lat, lng } = element;
                return (
                  <Marker
                    position={{
                      lat,
                      lng
                    }}
                    animation={this.naverMaps.Animation.BOUNCE}
                    onClick={() => {
                      alert("약국");
                    }}
                  />
                );
              })}
          </NaverMap>
        </RenderAfterNavermapsLoaded>
      </div>
    );
  }
}
