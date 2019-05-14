import React, { Component } from "react";
import {
  createStackNavigator,
  createAppContainer,
  createDrawerNavigator,
  createSwitchNavigator
} from "react-navigation";
import { DeviceEventEmitter } from "react-native";
import StackViewStyleInterpolator from "react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator";
import HomeScreen from "./pages/Home";
import DetailsScreen from "./pages/Details";
import DrawerScreen from "./pages/Drawer";
import ImgScreen from "./pages/ImgView";
import SectionScreen from "./pages/Section";
import CommentScreen from "./pages/Comment";
import TestScreen from "./pages/Test";
import LoginScreen from "./pages/Login";
import SignInScreen from "./pages/Login/SignIn";
import RegisteredScreen from "./pages/Registered";
import JoinScreen from "./pages/Registered/Join";
import SettingScreen from "./pages/Setting";
import { MenuProvider } from "react-native-popup-menu";
import { Provider, observer, inject } from "mobx-react";
import stores from "./store";
import codePush from "react-native-code-push";
import { Tools, Api, Axios } from "./config";
import "./config/storage";

/*
 *   构建导航
 *
 *   导航结构 ：
 *      >Drawer
 *      >Home
 *          >>Details
 *          >>....
 *
 */
// 二级导航
const MainScreen = createStackNavigator(
  {
    Home: HomeScreen,
    Details: DetailsScreen,
    ImgView: ImgScreen,
    Test: TestScreen,
    Section: SectionScreen,
    Comment: CommentScreen,
    Login: LoginScreen,
    SignIn: SignInScreen,
    Registered: RegisteredScreen,
    Join: JoinScreen,
    Setting: SettingScreen
  },
  {
    // 设置header默认样式
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#00a2ed"
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontSize: 16
      }
    },
    // 设置转场动画效果（安卓实现类似iOS的push动画)    来源： https://www.jianshu.com/p/dc9df5826651
    transitionConfig: () => ({
      screenInterpolator: StackViewStyleInterpolator.forHorizontal,
      transitionSpec: {
        duration: 280
      }
    })
  }
);

MainScreen.navigationOptions = ({ navigation }) => {
  let drawerLockMode = "unlocked";
  if (navigation.state.index > 0) {
    drawerLockMode = "locked-closed";
  }
  return {
    drawerLockMode
  };
};

//  根节点抽屉导航
const AppNavigator = createDrawerNavigator(
  {
    Main: {
      screen: MainScreen
    },
    Drawer: {
      screen: DrawerScreen
    }
  },
  {
    contentComponent: DrawerScreen
  }
);

const defaultGetStateForAction = AppNavigator.router.getStateForAction;

AppNavigator.router.getStateForAction = (action, state) => {
  if (action) {
    if (action.type == "Navigation/MARK_DRAWER_SETTLING" && action.willShow) {
      //Drawer 显示
      DeviceEventEmitter.emit("drawerState", {
        focus: true
      });
    } else if (
      action.type == "Navigation/MARK_DRAWER_SETTLING" &&
      !action.willShow
    ) {
      // Drawer 关闭
      // DeviceEventEmitter.emit('drawerState',{
      //   focus:false
      // })
    }
  }

  return defaultGetStateForAction(action, state);
};

let Navigation = createAppContainer(AppNavigator);



@observer
class App extends React.Component {
  // 热更新状态
  codePushStatusDidChange(status) {
    switch (status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        // console.warn("正在检查更新");
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        Tools.toast('开始下载更新...');
        // console.warn("开始下载更新");
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        Tools.toast('正在安装更新...');
        // console.warn("安装更新.");
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        // console.warn("当前为最新包");
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        // console.warn("已安装更新。");
        break;
    }
  }
  // 热更新下载进度
  codePushDownloadDidProgress(progress) {
    // console.warn(
    //    "下载进度 ："+progress.receivedBytes + " 总共 ："+progress.totalBytes 
    // );
  }
  render() {
    return (
      <Provider {...stores}>
        <MenuProvider>
          <Navigation
            screenProps={{ theme: stores.theme.colors.navBackground }}
          />
        </MenuProvider>
      </Provider>
    );
  }
}

// 热更新配置
const CodePushOptions = {
  updateDialog: {
    //指示是否要将可用版本的描述附加到显示给最终用户的通知消息中。默认为false。
    appendReleaseDescription:false,
    // 表示在向最终用户显示更新通知时，您希望在发布说明前加上字符串（如果有）。默认为" Description: "
    descriptionPrefix :'',
    // 用于最终用户必须按下的按钮的文本，以便安装强制更新。默认为"Continue"。
    mandatoryContinueButtonLabel:'安装',
    // 将更新指定为必需时，用作更新通知正文的文本。默认为"An update is available that must be installed."
    mandatoryUpdateMessage:'重要更新，新版很好用的!',
    // 用于最终用户可以按下的按钮的文本，以便忽略可用的可选更新。默认为"Ignore"
    optionalIgnoreButtonLabel:'拒绝吾儿',
    // 用于最终用户可以按下以便安装可选更新的按钮的文本。默认为"Install"
    optionalInstallButtonLabel :'立即更新',
    //当更新是可选的时，用作更新通知正文的文本。默认为"An update is available. Would you like to install it?"。
    optionalUpdateMessage :'赏脸更新一下吧，新版很好用的!',
    // 用作向最终用户显示的更新通知的标题的文本。默认为"Update available"。
    title:'爸爸，有新版本！'
  },
  // 指定何时安装可选更新（即未标记为必需更新的更新）。默认为codePush.InstallMode.ON_NEXT_RESTART。
  installMode: codePush.InstallMode.IMMEDIATE //表示您要安装更新并立即重新启动应用程序。
};

export default codePush(CodePushOptions)(App);
