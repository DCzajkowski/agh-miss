import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { Constants, MapView, Location, Permissions } from 'expo'

const BASE_URL = 'https://mobtracer.herokuapp.com'

export default class App extends Component {
  state = {
    mapRegion: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    locationResult: null,
    location: {
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    },
    markers: [],
  }

  componentDidMount() {
    this.getLocationAsync()
    this.setTimer()
  }

  setTimer = () => {
    setInterval(() => this.fetchLocations(), 5000)
    this.fetchLocations()
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
      this.setState({
        locationResult: 'Permission to access location was denied',
        location,
      })
    }

    const location = await Location.getCurrentPositionAsync({})

    this.setState({ locationResult: JSON.stringify(location), location })
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
            />
          ))}
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
