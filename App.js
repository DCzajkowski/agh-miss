import React, { Component } from 'react'
import { View, StyleSheet, AsyncStorage } from 'react-native' // AsyncStorage
import { Constants, MapView, Location, Permissions } from 'expo'
import flatten from 'lodash/flatten'
import random from 'lodash/random'

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
    await this.setUser()
    this.setLocationAsync()
    this.setTimer()
    this.fetchLocations()
  }

  setUser = async () => {
    let user

    try {
      user = await AsyncStorage.getItem('user')

      if (user !== null) {
        this.setState({ user })
        return
      }
    } catch (error) {}

    const names = ['Aaren', 'Aarika', 'Abagael', 'Abagail', 'Abbe', 'Abbey', 'Abbi', 'Abbie', 'Abby', 'Abbye', 'Abigael', 'Abigail', 'Abigale', 'Abra', 'Ada', 'Adah', 'Adaline', 'Adan', 'Adara', 'Adda', 'Addi', 'Addia', 'Addie', 'Addy', 'Adel', 'Adela', 'Adelaida', 'Adelaide', 'Adele', 'Adelheid', 'Adelice', 'Adelina', 'Adelind', 'Adeline', 'Adella', 'Adelle', 'Adena', 'Adey', 'Adi', 'Adiana', 'Adina', 'Adora', 'Adore', 'Adoree', 'Adorne', 'Adrea', 'Adria', 'Adriaens', 'Adrian', 'Adriana', 'Adriane', 'Adrianna', 'Adrianne', 'Adriena', 'Adrienne', 'Aeriel', 'Aeriela', 'Aeriell', 'Afton', 'Ag', 'Agace', 'Agata', 'Agatha', 'Agathe', 'Aggi', 'Aggie', 'Aggy', 'Agna', 'Agnella', 'Agnes', 'Agnese', 'Agnesse', 'Agneta', 'Agnola', 'Agretha', 'Aida', 'Aidan', 'Aigneis', 'Aila', 'Aile', 'Ailee', 'Aileen', 'Ailene', 'Ailey', 'Aili', 'Ailina', 'Ailis', 'Ailsun', 'Ailyn', 'Aime', 'Aimee', 'Aimil', 'Aindrea', 'Ainslee', 'Ainsley', 'Ainslie', 'Ajay', 'Alaine', 'Alameda', 'Alana', 'Alanah', 'Alane', 'Alanna', 'Alayne', 'Alberta', 'Albertina', 'Albertine', 'Albina', 'Alecia', 'Aleda', 'Aleece', 'Aleen', 'Alejandra', 'Alejandrina', 'Alena', 'Alene', 'Alessandra', 'Aleta', 'Alethea', 'Alex', 'Alexa', 'Alexandra', 'Alexandrina', 'Alexi', 'Alexia', 'Alexina', 'Alexine', 'Alexis', 'Alfi', 'Alfie', 'Alfreda', 'Alfy', 'Ali', 'Alia', 'Alica', 'Alice', 'Alicea', 'Alicia', 'Alida', 'Alidia', 'Alie', 'Alika', 'Alikee', 'Alina', 'Aline', 'Alis', 'Alisa', 'Alisha', 'Alison', 'Alissa', 'Alisun', 'Alix', 'Aliza', 'Alla', 'Alleen', 'Allegra', 'Allene', 'Alli', 'Allianora', 'Allie', 'Allina', 'Allis', 'Allison', 'Allissa', 'Allix', 'Allsun', 'Allx', 'Ally', 'Allyce', 'Allyn', 'Allys', 'Allyson', 'Alma', 'Almeda', 'Almeria', 'Almeta', 'Almira', 'Almire', 'Aloise', 'Aloisia', 'Aloysia', 'Alta', 'Althea', 'Alvera', 'Alverta', 'Alvina', 'Alvinia', 'Alvira', 'Alyce', 'Alyda', 'Alys', 'Alysa', 'Alyse', 'Alysia', 'Alyson', 'Alyss', 'Alyssa', 'Amabel', 'Amabelle', 'Amalea', 'Amalee', 'Amaleta', 'Amalia', 'Amalie', 'Amalita', 'Amalle', 'Amanda', 'Amandi', 'Amandie', 'Amandy', 'Amara', 'Amargo', 'Amata', 'Amber', 'Amberly', 'Ambur', 'Ame', 'Amelia', 'Amelie', 'Amelina', 'Ameline', 'Amelita', 'Ami', 'Amie', 'Amii', 'Amil', 'Amitie', 'Amity', 'Ammamaria', 'Amy', 'Amye', 'Ana', 'Anabal', 'Anabel', 'Anabella', 'Anabelle', 'Analiese', 'Analise', 'Anallese', 'Anallise', 'Anastasia', 'Anastasie', 'Anastassia', 'Anatola', 'Andee', 'Andeee', 'Anderea', 'Andi', 'Andie', 'Andra', 'Andrea', 'Andreana', 'Andree', 'Andrei', 'Andria', 'Andriana', 'Andriette', 'Andromache', 'Andy', 'Anestassia', 'Anet', 'Anett', 'Anetta', 'Anette', 'Ange', 'Angel', 'Angela', 'Angele', 'Angelia', 'Angelica', 'Angelika', 'Angelina', 'Angeline', 'Angelique', 'Angelita', 'Angelle', 'Angie', 'Angil', 'Angy', 'Ania', 'Anica', 'Anissa', 'Anita', 'Anitra', 'Anjanette', 'Anjela', 'Ann', 'Ann-Marie', 'Anna', 'Anna-Diana', 'Anna-Diane', 'Anna-Maria', 'Annabal', 'Annabel', 'Annabela', 'Annabell', 'Annabella', 'Annabelle', 'Annadiana', 'Annadiane', 'Annalee', 'Annaliese', 'Annalise', 'Annamaria', 'Annamarie', 'Anne', 'Anne-Corinne', 'Anne-Marie', 'Annecorinne', 'Anneliese', 'Annelise', 'Annemarie', 'Annetta', 'Annette', 'Anni', 'Annice', 'Annie', 'Annis', 'Annissa', 'Annmaria', 'Annmarie', 'Annnora', 'Annora', 'Anny', 'Anselma', 'Ansley', 'Anstice', 'Anthe', 'Anthea', 'Anthia', 'Anthiathia', 'Antoinette', 'Antonella', 'Antonetta', 'Antonia', 'Antonie', 'Antonietta', 'Antonina', 'Anya', 'Appolonia', 'April', 'Aprilette', 'Ara', 'Arabel', 'Arabela', 'Arabele', 'Arabella', 'Arabelle', 'Arda', 'Ardath', 'Ardeen', 'Ardelia', 'Ardelis', 'Ardella', 'Ardelle', 'Arden', 'Ardene', 'Ardenia', 'Ardine', 'Ardis', 'Ardisj', 'Ardith', 'Ardra', 'Ardyce', 'Ardys', 'Ardyth', 'Aretha', 'Ariadne', 'Ariana', 'Aridatha', 'Ariel', 'Ariela', 'Ariella', 'Arielle', 'Arlana', 'Arlee', 'Arleen', 'Arlen', 'Arlena', 'Arlene', 'Arleta', 'Arlette', 'Arleyne', 'Arlie', 'Arliene', 'Arlina', 'Arlinda', 'Arline', 'Arluene', 'Arly', 'Arlyn', 'Arlyne', 'Aryn', 'Ashely', 'Ashia', 'Barby', 'Bari', 'Barrie', 'Barry', 'Basia', 'Bathsheba', 'Batsheva', 'Bea', 'Beatrice', 'Beatrisa', 'Beatrix', 'Beatriz', 'Bebe', 'Becca', 'Becka', 'Becki', 'Beckie', 'Becky', 'Bee', 'Beilul', 'Beitris', 'Bekki', 'Bel', 'Belia', 'Belicia', 'Belinda', 'Belita', 'Bell', 'Bella', 'Bellanca', 'Belle', 'Bellina', 'Belva', 'Belvia', 'Bendite', 'Benedetta', 'Benedicta', 'Benedikta', 'Benetta', 'Benita', 'Benni', 'Bennie', 'Benny', 'Benoite', 'Berenice', 'Beret', 'Berget', 'Berna', 'Bernadene', 'Bernadette', 'Bernadina', 'Bernadine', 'Bernardina', 'Bernardine', 'Bernelle', 'Bernete', 'Bernetta', 'Bernette', 'Berni', 'Bernice', 'Bernie', 'Bernita', 'Berny', 'Berri', 'Berrie', 'Berry', 'Bert', 'Berta', 'Berte', 'Bertha', 'Berthe', 'Berti', 'Bertie', 'Bertina', 'Bertine', 'Berty', 'Beryl', 'Beryle', 'Bess', 'Bessie', 'Bessy', 'Beth', 'Bethanne', 'Bethany', 'Bethena', 'Bethina', 'Betsey', 'Betsy', 'Betta', 'Bette', 'Bette-Ann', 'Betteann', 'Betteanne', 'Betti', 'Bettina', 'Bettine', 'Betty', 'Brande', 'Brandea', 'Brandi', 'Brandice', 'Brandie', 'Brandise', 'Brandy', 'Breanne', 'Brear', 'Bree', 'Breena', 'Bren', 'Brena', 'Brenda', 'Brenn', 'Brenna', 'Brett', 'Bria', 'Briana', 'Brianna', 'Brianne', 'Bride', 'Bridget', 'Bridgette', 'Bridie', 'Brier', 'Brietta', 'Brigid', 'Brigida', 'Brigit', 'Brigitta', 'Brigitte', 'Brina', 'Briney', 'Brinn', 'Brinna', 'Briny', 'Brit', 'Brita', 'Britney', 'Britni', 'Britt', 'Britta', 'Brittan', 'Brittaney', 'Brittani', 'Brittany', 'Britte', 'Britteny', 'Brittne', 'Brittney', 'Brittni', 'Brook', 'Brooke', 'Brooks', 'Brunhilda', 'Brunhilde', 'Bryana', 'Bryn', 'Bryna', 'Brynn', 'Brynna', 'Brynne', 'Cari', 'Caria', 'Carie', 'Caril', 'Carilyn', 'Carin', 'Carina', 'Carine', 'Cariotta', 'Carissa', 'Carita', 'Caritta', 'Carla', 'Carlee', 'Carleen', 'Carlen', 'Carlene', 'Carley', 'Carlie', 'Carlin', 'Carlina', 'Carline', 'Carlita', 'Carlota', 'Carlotta', 'Carly', 'Carlye', 'Carlyn', 'Carlynn', 'Carlynne', 'Carma', 'Carmel', 'Carmela', 'Carmelia', 'Carmelina', 'Carmelita', 'Carmella', 'Carmelle', 'Carmen', 'Carmencita', 'Carmina', 'Carmine', 'Carmita', 'Carmon', 'Caro', 'Carol', 'Carol-Jean', 'Carola', 'Carolan', 'Carolann', 'Carole', 'Carolee', 'Carolin', 'Carolina', 'Caroline', 'Caroljean', 'Carolyn', 'Carolyne', 'Carolynn', 'Caron', 'Carree', 'Carri', 'Carrie', 'Carrissa', 'Carroll', 'Carry', 'Cary', 'Caryl', 'Caryn', 'Casandra', 'Casey', 'Casi', 'Casie', 'Cass', 'Cassandra', 'Cassandre', 'Cassandry', 'Cassaundra', 'Cassey', 'Cassi', 'Cassie', 'Cassondra', 'Cassy', 'Catarina', 'Cate', 'Caterina', 'Catha', 'Catharina', 'Catharine', 'Cathe', 'Cathee', 'Cherice', 'Cherida', 'Cherie', 'Cherilyn', 'Cherilynn', 'Cherin', 'Cherise', 'Cherish', 'Cherlyn', 'Cherri', 'Cherrita', 'Cherry', 'Chery', 'Cherye', 'Cheryl', 'Cheslie', 'Chiarra', 'Chickie', 'Chicky', 'Chiquia', 'Chiquita', 'Chlo', 'Chloe', 'Chloette', 'Chloris', 'Chris', 'Chrissie', 'Chrissy', 'Christa', 'Christabel', 'Christabella', 'Christal', 'Christalle', 'Christan', 'Christean', 'Christel', 'Christen', 'Christi', 'Christian', 'Christiana', 'Christiane', 'Christie', 'Christin', 'Christina', 'Christine', 'Christy', 'Christye', 'Christyna', 'Chrysa', 'Chrysler', 'Chrystal', 'Chryste', 'Chrystel', 'Cicely', 'Cicily', 'Ciel', 'Cilka', 'Cinda', 'Cindee', 'Cindelyn', 'Cinderella', 'Cindi', 'Cindie', 'Cindra', 'Cindy', 'Cinnamon', 'Cissiee', 'Cissy', 'Clair', 'Claire', 'Clara', 'Clarabelle', 'Clare', 'Claresta', 'Clareta', 'Claretta', 'Clarette', 'Clarey', 'Clari', 'Claribel', 'Clarice', 'Clarie', 'Clarinda', 'Cora', 'Corabel', 'Corabella', 'Corabelle', 'Coral', 'Coralie', 'Coraline', 'Coralyn', 'Cordelia', 'Cordelie', 'Cordey', 'Cordi', 'Cordie', 'Cordula', 'Cordy', 'Coreen', 'Corella', 'Corenda', 'Corene', 'Coretta', 'Corette', 'Corey', 'Cori', 'Corie', 'Corilla', 'Cyndie', 'Cyndy', 'Cynthea', 'Cynthia', 'Cynthie', 'Cynthy', 'Dacey', 'Dacia', 'Dacie', 'Dacy', 'Dael', 'Daffi', 'Daffie', 'Daffy', 'Dagmar', 'Dahlia', 'Daile', 'Daisey', 'Daisi', 'Daisie', 'Daisy', 'Dale', 'Dalenna', 'Dalia', 'Dalila', 'Dallas', 'Daloris', 'Damara', 'Damaris', 'Damita', 'Dana', 'Danell', 'Danella', 'Danette', 'Dani', 'Dania', 'Danica', 'Danice', 'Daniela', 'Daniele', 'Daniella', 'Danielle', 'Danika', 'Danila', 'Danit', 'Danita', 'Danna', 'Danni', 'Dannie', 'Danny', 'Dannye', 'Danya', 'Danyelle', 'Danyette', 'Daphene', 'Daphna', 'Daphne', 'Dara', 'Darb', 'Darbie', 'Darby', 'Darcee', 'Darcey', 'Darlleen', 'Daron', 'Darrelle', 'Darryl', 'Darsey', 'Darsie', 'Darya', 'Daryl', 'Daryn', 'Dasha', 'Dasi', 'Dasie', 'Dasya', 'Datha', 'Deidre', 'Deina', 'Deirdre', 'Del', 'Dela', 'Delcina', 'Delcine', 'Delia', 'Delila', 'Delilah', 'Delinda', 'Dell', 'Della', 'Delly', 'Delora', 'Delores', 'Deloria', 'Deloris', 'Delphine', 'Delphinia', 'Demeter', 'Demetra', 'Demetria', 'Demetris', 'Dena', 'Deni', 'Denice', 'Denise', 'Denna', 'Denni', 'Dennie', 'Denny', 'Deny', 'Denys', 'Denyse', 'Deonne', 'Desdemona', 'Desirae', 'Desiree', 'Desiri', 'Deva', 'Devan', 'Devi', 'Devin', 'Devina', 'Devinne', 'Devon', 'Devondra', 'Devonna', 'Devonne', 'Devora', 'Di', 'Diahann', 'Dian', 'Diana', 'Diandra', 'Diane', 'Diane-Marie', 'Dianemarie', 'Diann', 'Dianna', 'Dianne', 'Diannne', 'Didi', 'Dido', 'Diena', 'Dierdre', 'Dina', 'Dinah', 'Dinnie', 'Dinny', 'Dion', 'Dione', 'Dionis', 'Dionne', 'Dita', 'Dix', 'Dixie', 'Dniren', 'Dode', 'Dodi', 'Dodie', 'Dody', 'Doe', 'Doll', 'Dolley', 'Dolli', 'Dollie', 'Dolly', 'Dolores', 'Dolorita', 'Elena', 'Elene', 'Eleni', 'Elenore', 'Eleonora', 'Eleonore', 'Elfie', 'Elfreda', 'Elfrida', 'Elfrieda', 'Elga', 'Elianora', 'Elianore', 'Elicia', 'Ellie', 'Ellissa', 'Elly', 'Ellyn', 'Ellynn', 'Elmira', 'Elna', 'Elnora', 'Elnore', 'Eloisa', 'Eloise', 'Elonore', 'Elora', 'Elsa', 'Elsbeth', 'Else', 'Elset', 'Elsey', 'Elsi', 'Elsie', 'Elsinore', 'Elspeth', 'Elsy', 'Elva', 'Elvera', 'Elvina', 'Elvira', 'Elwira', 'Elyn', 'Elyse', 'Elysee', 'Elysha', 'Elysia', 'Elyssa', 'Em', 'Ema', 'Emalee', 'Emalia', 'Emelda', 'Emelia', 'Emelina', 'Emeline', 'Emelita', 'Emelyne', 'Emera', 'Emilee', 'Emili', 'Emilia', 'Emilie', 'Emiline', 'Emily', 'Emlyn', 'Emlynn', 'Emlynne', 'Emma', 'Emmalee', 'Emmaline', 'Emmalyn', 'Emmalynn', 'Emmalynne', 'Emmeline', 'Emmey', 'Emmi']

    user = names[random(0, 999)]

    try {
      await AsyncStorage.setItem('user', user)
    } catch (error) {}

    this.setState({ user })
  }

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
      this.setState({ viewsHistory: false, markers: [] })
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
          key={`poly-${list[0].id}`}
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
