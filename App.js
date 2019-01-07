import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native' // AsyncStorage
import { Constants, MapView, Location, Permissions } from 'expo'
import flatten from 'lodash/flatten'

const BASE_URL = 'https://mobtracer.herokuapp.com'

function fuzzyDate(date) {
  const delta = Math.round((+new Date - date) / 1000)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7

  if (delta < 30) {
    return 'Just now.'
  } else if (delta < minute) {
    return delta + ' seconds ago.'
  } else if (delta < 2 * minute) {
    return '1 minute ago.'
  } else if (delta < hour) {
    return Math.floor(delta / minute) + ' minutes ago.'
  } else if (Math.floor(delta / hour) == 1) {
    return '1 hour ago.'
  } else if (delta < day) {
    return Math.floor(delta / hour) + ' hours ago.'
  } else if (delta < day * 2) {
    return 'yesterday'
  }

  return ''
}

export default class App extends Component {
  state = {
    viewsHistory: false,
    user: null,
    mapRegion: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    location: {
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    },
    markers: [],
  }

  async componentDidMount() {
    // await this.setUser()
    this.setState({ user: Math.random() })
    this.setLocationAsync()
    this.setTimer()
    this.fetchLocations()
  }

  // setUser = async () => {
  //   let user

  //   try {
  //     user = await AsyncStorage.getItem('user')

  //     if (user !== null) {
  //       this.setState({ user })
  //       return
  //     }
  //   } catch (error) {}

  //   user = String(Math.random())

  //   try {
  //     await AsyncStorage.setItem('user', user)
  //   } catch (error) {}

  //   this.setState({ user })
  // }

  setTimer = () => {
    setInterval(() => {
      if (!this.state.viewsHistory) {
        this.fetchLocations()
      }
      this.postLocationAsync()
    }, 5000)
  }

  postLocationAsync = () => {
    const { user, location: { coords: { latitude, longitude } } } = this.state

    fetch(`${BASE_URL}/locations`, {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ user, latitude, longitude }),
    })
  }

  setLocationAsync = async () => {
    const location = await this.getLocationAsync()

    this.setState({ location })
  }

  fetchLocations = async () => {
    const response = await fetch(`${BASE_URL}/locations`)
    const markers = await response.json()

    // const dates = Object.keys(data).sort().reverse()

    // const locations = [...data[dates[0]], ...data[dates[1]], ...data[dates[2]]]
    // const markers = []

    // for (const location of locations) {
    //   if (!markers.find(({ user }) => user == location.user)) {
    //     markers.push(location)
    //   }
    // }

    this.setState({ markers })
  }

  onRegionChange = mapRegion => {
    this.setState({ mapRegion })
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)

    if (status !== 'granted') {
      return // @todo
    }

    return await Location.getCurrentPositionAsync({})
  }

  markerClickHandler = async ({ user }) => {
    this.setState({ viewsHistory: true, markers: [] })

    const response = await fetch(`${BASE_URL}/locations/${user}`)
    const markers = await response.json()

    this.setState({ markers })
  }

  mapClickHandler = () => {
    if (this.state.viewsHistory) {
      this.setState({ viewsHistory: false })
      this.fetchLocations()
    }
  }

  render() {
    let mapContents = null

    if (this.state.viewsHistory) {
      // mapContents = (
      //   <MapView.Polyline
      //     coordinates={this.state.markers}
      //   />
      // )

      mapContents = this.state.markers.map(list => (
        <MapView.Polyline
          coordinates={list}
        />
      ))
    }

    let markersContent

    if (! this.state.viewsHistory) {
      markersContent = this.state.markers.map(marker => (
        <MapView.Marker
          key={marker.id}
          coordinate={marker}
          title={marker.user}
          description={fuzzyDate(new Date(marker.created_at))}
          onPress={this.markerClickHandler.bind(this, marker)}
        />
      ))
    } else {
      markersContent = flatten(this.state.markers).map(marker => (
        <MapView.Marker
          key={marker.id}
          coordinate={marker}
          title={marker.user}
          description={fuzzyDate(new Date(marker.created_at))}
          onPress={this.markerClickHandler.bind(this, marker)}
        />
      ))
    }

    return (
      <View style={styles.container}>
        <MapView
          style={{ alignSelf: 'stretch', flex: 1 }}
          region={this.mapRegion}
          onRegionChange={this.onRegionChange}
          onPress={this.mapClickHandler}
        >
          {mapContents}
          {markersContent}
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
})
