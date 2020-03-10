import React, { Component } from "react";
import userCenterIcon from "../Images/icon.svg";
import centerIcon from "../Images/move.gif";
import {
  RenderAfterNavermapsLoaded,
  NaverMap,
  Marker,
  Circle
} from "react-naver-maps";
import * as request from "./httpRequest";
import "./index.scss";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.naverMaps = window.naver.maps;
    this.mapRef = undefined;

    this.state = {
      searchValue: "",

      center: {
        lat: 37.49792,
        lng: 127.02757
      },
      userCenter: {
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
      m: this.state.radius
    });
    const json = await res.json();
    this.setState({
      storeDatas: json.stores
    });
    console.log(json);
  };

  componentDidMount() {
    // console.log(111, "eee", window.naver.maps.Event);
    console.log("componentDidMount");
    this.getData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState(
            {
              userCenter: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
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
      alert("GPS를 지원하지 않기 때문에 맵을 사용할 수 없습니다.");
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

  dragendListener = e => {
    const { _lat: lat, _lng: lng } = this.mapRef.instance.getCenter();
    this.setState(
      {
        center: {
          lat,
          lng
        }
      },
      () => {
        this.getData();
      }
    );
  };

  handleSelectChange = e => {
    this.setState(
      {
        radius: e.target.value
      },
      () => {
        this.getData();
      }
    );
  };

  render() {
    return (
      <div className="App">
        <div className="Header">
          <input
            type="text"
            name="searchValue"
            value={this.state.searchValue}
            onChange={this.handleInputChange}
            placeholder="search bar"
          />
          <select className="Header-select" onChange={this.handleSelectChange}>
            <option value={100}>반경 100m</option>
            <option value={200}>반경 200m</option>
            <option value={300}>반경 300m</option>
            <option value={400}>반경 400m</option>
            <option value={500}>반경 500m</option>
          </select>
        </div>

        <RenderAfterNavermapsLoaded
          ncpClientId={"fs0aqkdq7k"} // 자신의 네이버 계정에서 발급받은 Client ID
          error={<p>Maps Load Error</p>}
          loading={<p>Maps Loading...</p>}
        >
          <NaverMap
            naverRef={ref => {
              if (!this.mapRef) {
                this.mapRef = ref;
                window.naver.maps.Event.addListener(
                  this.mapRef.instance,
                  "dragend",
                  this.dragendListener
                );
              }
            }}
            mapDivId={"react-naver-map"} // default: react-naver-map
            style={{
              width: "100%", // 네이버지도 가로 길이
              height: "90vh" // 네이버지도 세로 길이
            }}
            center={this.state.center}
            defaultZoom={17} // 지도 초기 확대 배율
          >
            <Marker
              position={this.state.userCenter}
              clickable={false}
              icon={userCenterIcon}
              zIndex={10}
            />

            <Marker
              position={this.state.center}
              clickable={false}
              icon={centerIcon}
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
                    key={index}
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
