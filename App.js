import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native' // AsyncStorage
import { Constants, MapView, Location, Permissions } from 'expo'
// import _ from 'lodash'

const BASE_URL = 'https://mobtracer.herokuapp.com'

export default class App extends Component {
  state = {
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
  //     user = await AsyncStorage.getItem('user');

  //     if (user !== null) {
  //       this.setState({ user })
  //       return
  //     }
  //   } catch (error) {}

  //   user = String(Math.random())

  //   try {
  //     await AsyncStorage.setItem('user', user);
  //   } catch (error) {}

  //   this.setState({ user })
  // }

  setTimer = () => {
    setInterval(() => {
      this.fetchLocations()
      // this.postLocationAsync()
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
    const data = await response.json()

    const dates = Object.keys(data).sort().reverse()

    const locations = [...data[dates[0]], ...data[dates[1]], ...data[dates[2]]]
    const markers = []

    for (const location of locations) {
      if (!markers.find(({ user }) => user == location.user)) {
        markers.push(location)
      }
    }

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
    const response = await fetch(`${BASE_URL}/locations/dczajkowski`) // @todo user
    const data = await response.json()

    this.setState({ markers: Object.entries(data).map(([key, value]) => value[0]) })
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={{ alignSelf: 'stretch', flex: 1 }}
          region={this.mapRegion}
          onRegionChange={this.onRegionChange}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              key={marker.id}
              coordinate={marker}
              title="My Marker"
              description="Some description"
              onPress={this.markerClickHandler.bind(this, marker)}
            />
          ))}
          <MapView.Marker
            key={-1}
            coordinate={{
              id: -1,
              user: 'dczajkowski',
              latitude: 50.0880968,
              longitude: 19.910226,
            }}
            title="dczajkowski"
            description="Seen 2 seconds ago"
            onPress={this.markerClickHandler.bind(this, {
              id: -1,
              user: 'dczajkowski',
              latitude: 50.0880968,
              longitude: 19.910226,
            })}
          />
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
