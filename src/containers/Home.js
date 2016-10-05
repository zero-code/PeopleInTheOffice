import React, { Component } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  NetInfo
} from 'react-native'

import _ from 'lodash'

import PushNotification from 'react-native-push-notification'
import {Actions} from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import NetworkInfo from 'react-native-network-info';


import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import LinearGradient from 'react-native-linear-gradient';

const light = '#CB74FF';
const dark = '#7737FF';

const lightText = '#DABDFF';

const lightRed = '#FD96AF';
const darkRed = '#F35274';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PeopleActions from '../actions/people';


const uid = DeviceInfo.getUniqueID();

@connect(
  state => ({
    people: state.people
  }),
  dispatch => bindActionCreators(PeopleActions, dispatch)
)
export default class Home extends Component {

  constructor() {
    super();
  }

  componentWillMount() {
    this.props.listen();
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content');
    }
  }

  componentWillUnmount() {
    this.props.unlisten();
  }

  componentDidMount() {
    NetInfo.addEventListener('change', (xxx) => {
      NetworkInfo.getSSID((ssid) => {
        if(ssid.toLowerCase() === 'hootguest') {
          this.props.setStatus(true)
        } else {
          this.props.setStatus(false)
        }
      })

      if (xxx.toLowerCase() !== 'wifi') {
        this.props.setStatus(false)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.people.isLoading) {
      return;
    }

    if(nextProps.people.people[uid] && this.getOnlinePeople(nextProps.people.people) === 1) {
      this.notifyUser()
    }
  }

  getOnlinePeople(people = this.props.people.people) {
    return _.filter(people, (item) => item).length
  }

  notifyUser() {
    PushNotification.localNotification({
      /* Android Only Properties */
      id: '0', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
      subText: "This is a subText", // (optional) default: none
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: 'some_tag', // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification

      /* iOS only properties */
      // category: // (optional) default: null
      // userInfo: // (optional) default: null (object containing additional notification data)

      /* iOS and Android properties */
      title: "Careful", // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
      message: "You are the only one!",
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: 1, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
    });
  }

  render() {
    const {isOnline, isLoading, people} = this.props.people;

    return <LinearGradient
      start={[0.0, 0.1]} end={[0.4, 1.0]}
      locations={[0, 0.5]}
      colors={isOnline ? [light, dark] : [lightRed, darkRed]}
      style={styles.container}
    >
      <View style={styles.numberWrapper}>
        <Text style={styles.peopleOnline}>
          {isLoading ? '.' : this.getOnlinePeople()}
        </Text>
        <Text style={styles.normalText}>
          {isLoading ? '...'
                     : isOnline ? 'people in the office' : 'You are offline'}
          {isLoading ? '.... ' : people[uid] ? ' true' : ' false'}
        </Text>
      </View>
    </LinearGradient>;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'stretch',
    flex: 1
  },
  numberWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  normalText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18
  },
  peopleOnline: {
    fontSize: 256,
    lineHeight: 256,
    fontWeight: '100',
    color: "#fff",
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 5
    },
    shadowOpacity: .3,
    shadowRadius: 5
  }
});
