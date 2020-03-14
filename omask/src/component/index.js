import React, { Component } from "react";

import userCenterIcon from "../Images/userCenter.png";
import centerIcon from "../Images/center.png";
import goodIcon from "../Images/plenty.png";
import someIcon from "../Images/some.png";
import fewIcon from "../Images/few.png";
import nothingIcon from "../Images/empty.png";

import loadingIcon from "../Images/loading.gif";

import menuIcon from "../Images/menu.svg";
import searchIcon from "../Images/search.svg";

import moment from "moment";
import Select from "react-select";
import Switch from "react-switch";

import {
  RenderAfterNavermapsLoaded,
  NaverMap,
  Marker,
  Circle
} from "react-naver-maps";
import * as request from "./httpRequest";
import "./index.scss";
import { stringify } from "querystring";
import DaumPostcode from "react-daum-postcode";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.naverMaps = window.naver.maps;
    this.mapRef = undefined;
    this.infoWindow = undefined;
    this.day = this.getMaskDay();
    this.isMobile = Number(window.innerWidth) < 500;

    this.selectOptions = [
      { value: 100, label: "반경 100m" },
      { value: 200, label: "반경 200m" },
      { value: 300, label: "반경 300m" },
      { value: 400, label: "반경 400m" },
      { value: 500, label: "반경 500m" },
      { value: 1000, label: "반경 1000m" }
    ];

    this.state = {
      isLoading: false,
      searchValue: "",

      center: {
        lat: 37.49792,
        lng: 127.02757
      },
      userCenter: {
        lat: 37.49792,
        lng: 127.02757
      },
      isSoldoutAppear: true,
      storeDatas: [],
      radius: 1000
    };
  }

  getMaskDay = () => {
    const day = moment(new Date()).format("dddd");
    switch (day) {
      case "Monday":
        return ["월", "1, 6"];
      case "Tuesday":
        return ["화", "2, 7"];
      case "Wednesday":
        return ["수", "3, 8"];
      case "Thursday":
        return ["목", "4, 9"];
      case "Friday":
        return ["금", "0, 5"];
      case "Saturday":
      case "Sunday":
        return ["주말", "모든국민"];
    }
  };

  componentDidMount() {
    console.log("componentDidMount");
    this.getData(this.state.isSoldoutAppear);
    this.getCurrentPosition();

    document.getElementById("APP").style.height = window.innerHeight + "px";
    document.getElementById("MAP").style.height = window.innerHeight + "px";
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
  }

  getData = async isSoldoutAppear => {
    this.setState({ isLoading: true }, async () => {
      const { lat, lng } = this.state.center;
      try {
        const res = await request.getStoreData({
          lat,
          lng,
          m: this.state.radius
        });
        const json = await res.json();
        if (json.error) {
          alert("사용자 혹은 정부의 네트워크가 원활하지 않습니다.");
        } else {
          if (json.count === 0) {
            alert(`반경 ${this.state.radius}m 내에 약국이 없습니다`);
            this.setState({
              isLoading: false
            });
          } else {
            if (isSoldoutAppear) {
              this.setState({
                storeDatas: json.stores,
                isLoading: false
              });
            } else {
              this.setState({
                storeDatas: json.stores.filter(element => {
                  const remain = element.remain_stat;
                  return (
                    remain === "few" || remain === "some" || remain === "plenty"
                  );
                }),
                isLoading: false
              });
            }
          }
        }
      } catch (e) {
        console.log(e);
        alert(`유저 혹은 정부의 네트워크가 원활하지 않습니다.`);
        this.setState({
          isLoading: false
        });
      }
    });
  };

  getCurrentPosition() {
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
            () => {
              this.getData(this.state.isSoldoutAppear);
            }
          );
        },
        function(error) {
          alert(
            "위치 서비스를 차단해 놓으셨다면 허용하신 후 내 위치 버튼을 눌러주세요"
          );
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: Infinity
        }
      );
    } else {
      alert("GPS를 지원하지 않기 때문에 맵을 사용할 수 없습니다.");
    }
  }

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
        this.getData(this.state.isSoldoutAppear);
      }
    );
  };

  dragstartListener = e => {
    this.setState({
      storeDatas: []
    });
  };

  handleSelectChange = e => {
    this.setState(
      {
        radius: e.target.value
      },
      () => {
        this.getData(this.state.isSoldoutAppear);
      }
    );
  };

  onClickMyPositionBtn = () => {
    this.getCurrentPosition();
  };

  handleComplete = data => {
    window.naver.maps.Service.geocode(
      {
        query:
          data.autoJibunAddress.length > 1
            ? data.autoJibunAddress
            : data.jibunAddress
      },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          return alert("검색어를 확인해 주세요!");
        }
        let results = response.v2.addresses;

        this.setState(
          {
            center: {
              lat: results[0].y,
              lng: results[0].x
            }
          },
          () => {
            this.getData(this.state.isSoldoutAppear);
          }
        );
      }
    );
  };

  onClickSoldout = checked => {
    console.log(this.state.isSoldoutAppear);

    this.setState(
      {
        isSoldoutAppear: checked
      },
      () => {
        this.getData(this.state.isSoldoutAppear);
      }
    );
  };

  // marker popup
  handleMarker = element => {
    // const { lat, lng } = element;
    // if (!this.infoWindow) {
    //   this.infoWindow = new window.naver.maps.InfoWindow({
    //     position: new window.naver.maps.LatLng(lat + 0.0003, lng),
    //     content: `약국 이름 : ${element.name}      주소 : ${element.addr}`,
    //     maxWidth: 140,
    //     backgroundColor: "#eee",
    //     borderColor: "#2db400",
    //     borderWidth: 5,
    //     anchorSize: new window.naver.maps.Size(10, 10),
    //     anchorSkew: true,
    //     anchorColor: "#eee",
    //     pixelOffset: new window.naver.maps.Point(20, -5)
    //   });
    // }
    // this.infoWindow.open(this.mapRef.instance);
  };

  onClickSidebarToggle = () => {
    document.getElementById("sidebar").classList.toggle("sidebar-hide");
  };

  render() {
    return (
      <div id="APP" className="App">
        <div className="Header"> </div>
        <div id="MAP" className="MapPart">
          {this.state.isLoading && (
            <div className="overlay">
              <img
                className="loadingIcon"
                src={loadingIcon}
                alt="loadingIcon"
              />
            </div>
          )}

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
                  window.naver.maps.Event.addListener(
                    this.mapRef.instance,
                    "dragstart",
                    this.dragstartListener
                  );
                }
              }}
              mapDivId={"react-naver-map"} // default: react-naver-map
              style={{
                width: "100%", // 네이버지도 가로 길이
                height: "100%" // 네이버지도 세로 길이
              }}
              center={this.state.center}
              defaultZoom={this.isMobile ? 15 : 16} // 지도 초기 확대 배율
              onClick={() => {
                if (this.infoWindow) {
                  this.infoWindow.close();
                }
              }}
            >
              <Marker
                position={this.state.userCenter}
                clickable={true}
                icon={userCenterIcon}
                zIndex={10}
                onClick={() => {
                  alert(`현재 위치 입니다 ^.^`);
                }}
              />

              {stringify(this.state.center) !==
                stringify(this.state.userCenter) && (
                <Marker
                  position={this.state.center}
                  clickable={false}
                  icon={centerIcon}
                  animation={this.naverMaps.Animation.BOUNCE}
                />
              )}
              <Circle
                center={this.state.center}
                radius={this.state.radius}
                fillOpacity={0.2}
                fillColor={"#5DADE2"}
                strokeColor={"#5DADE2"}
                clickable={false}
              />
              {this.state.storeDatas &&
                this.state.storeDatas.map((element, index) => {
                  const { lat, lng, remain_stat } = element;
                  let icon;
                  let remain;
                  switch (remain_stat) {
                    case "empty":
                      icon = nothingIcon;
                      remain = "품절";
                      break;
                    case "few":
                      icon = fewIcon;
                      remain = "30개 미만! 방문 하셔도 품절일 수 있습니다.";
                      break;
                    case "some":
                    case "plenty":
                      icon = goodIcon;
                      remain = "30개 이상! 방문하시는 것을 추천드립니다";
                      break;
                    default:
                      icon = nothingIcon;
                      remain = "품절";
                      break;
                  }

                  return (
                    <div key={index}>
                      <Marker
                        title={`약국 이름 : ${element.name}\n주소 : ${element.addr}`}
                        position={{
                          lat,
                          lng
                        }}
                        icon={icon}
                        onClick={
                          remain_stat !== "empty"
                            ? () => {
                                alert(
                                  `마스크 재고 : ${remain}\n약국 이름 : ${element.name}\n주소 : ${element.addr}`
                                );
                                // this.handleMarker(element);
                              }
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
            </NaverMap>
          </RenderAfterNavermapsLoaded>

          {/* <div id="sidebar" className="sidebar sidebar-hide">
            <img
              className="sidebar_toggle"
              src={searchIcon}
              alt="menuIcon"
              onClick={this.onClickSidebarToggle}
            />

            <div className="sidebar_search">
              <DaumPostcode
                onComplete={this.handleComplete}
                // autoResize={true}
                animation={true}
                height={"100%"}
              />
            </div>
          </div> */}
          {/* <div className="mapWrapper"> */}

          {/* 오른쪽 아래 반경 선택 버튼 */}
          {/* <Select
            className="Header-select"
            value={null}
            onChange={this.handleSelectChange}
            options={this.options}
            defaultValue={500}
          /> */}
          <select
            className="SelectBtn"
            onChange={this.handleSelectChange}
            defaultValue={1000}
          >
            <option value={100}>반경 100m</option>
            <option value={200}>반경 200m</option>
            <option value={300}>반경 300m</option>
            <option value={400}>반경 400m</option>
            <option value={500}>반경 500m</option>
            <option value={1000}>반경 1km</option>
            <option value={2000}>반경 2km</option>
            <option value={3000}>반경 3km</option>
            <option value={4000}>반경 4km</option>
            <option value={5000}>반경 5km</option>
          </select>

          {/* 왼쪽 아래 내 위치 버튼 */}
          {/* sidebar_utils */}
          <div className="buttonWrapper" onClick={this.onClickMyPositionBtn}>
            <img src={centerIcon} width={25} alt="focus" />
            <p className="Header-button">내 위치</p>
          </div>

          {/* 왼쪽 위  */}
          {/* sidebar_markers */}
          <div className="DailyIndicator">
            <div className="DailyIndicator__ItemWrapper">
              <p className="DailyIndicator__ItemWrapper--day">{this.day[0]}</p>
              <p className="DailyIndicator__ItemWrapper--born">{this.day[1]}</p>
            </div>
          </div>

          {/* 오른쪽 위  */}
          {/* sidebar_markers */}
          <div className="sidebar_markerWrapper">
            <div className="sidebar_markers">
              <div className="sidebar_title"></div>
              <div className="sidebar_marker">
                <img src={goodIcon} alt="good" />
                <p className="sidebar_marker_desc" style={{ color: "red" }}>
                  100+
                </p>
              </div>
              <div className="sidebar_marker">
                <img src={someIcon} alt="few" />
                <p className="sidebar_marker_desc" style={{ color: "#F08D07" }}>
                  30+
                </p>
              </div>
              <div className="sidebar_marker">
                <img src={fewIcon} alt="few" />
                <p className="sidebar_marker_desc" style={{ color: "green" }}>
                  2+
                </p>
              </div>
              <div className="sidebar_marker">
                {/* <img className="opa" src={nothingIcon} alt="nothingIcon" />
                <p className="sidebar_marker_desc">0</p> */}
                <Switch
                  wit
                  onChange={this.onClickSoldout}
                  checked={this.state.isSoldoutAppear}
                  onColor="#79CDF0"
                  checkedIcon={
                    <img
                      src={nothingIcon}
                      alt="nothingIcon"
                      style={{
                        paddingTop: "4px",
                        height: "20px"
                      }}
                    />
                  }
                  width={70}
                  height={30}
                />
              </div>
              {/* <div className="sidebar_marker">
                <img src={userCenterIcon} alt="userCenterIcon" />
                <p className="sidebar_marker_desc">현재위치</p>
              </div>
              <div className="sidebar_marker">
                <img src={centerIcon} alt="centerIcon" />
                <p className="sidebar_marker_desc">기준 위치 (반경)</p>
              </div> */}
            </div>
          </div>
        </div>
        {/* <div className="Footer">d</div> */}
      </div>
    );
  }
}
