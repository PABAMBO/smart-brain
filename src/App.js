import { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg';
import './App.css';

// const clarifaiRequestOptions = (imageUrl) => {
//   const PAT = '61e259ae468f44b699ea0e03644d5161';
//   const USER_ID = 'pab2105';       
//   const APP_ID = 'Test';

//   // const MODEL_ID = 'face-detection';  
//   const IMAGE_URL = imageUrl;

//   const raw = JSON.stringify({
//         "user_app_id": {
//             "user_id": USER_ID,
//             "app_id": APP_ID
//         },
//         "inputs": [
//             {
//                 "data": {
//                     "image": {
//                         "url": IMAGE_URL
//                     }
//                 }
//             }
//         ]
//     });
//     const requestOptions = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Authorization': 'Key ' + PAT
//         },
//         body: raw
//     };
//     return requestOptions
// }

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;   
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

    calculateFaceLocation = (data) => {
    if (data && data[0].data.regions) {
      const face = data[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - (face.right_col * width),
        bottomRow: height - (face.bottom_row * height)
      }
    }
    return null;
  }

  displayBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});

      fetch('http://localhost:3001/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            input: this.state.input,
            })
          })
      .then(response => response.json())
      .then(result => {
        if (result) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            id: this.state.user.id,
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
                  const faceLocation = this.calculateFaceLocation(result);
          if (faceLocation) {
            this.displayBox(faceLocation);
          } else {
            console.log('No face detected');
          }
        }
      })
      .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render () {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg className='particles' color="#3f0a19" num={100} type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
        ?
        <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm 
        onInputChange={this.onInputChange} 
        onButtonSubmit={this.onButtonSubmit} />
        <FaceRecognition box={box} imageUrl={imageUrl} />
      </div>
      : (this.state.route === 'signin' 
      ?  <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
      : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )   
      }
      </div>
    ); 
  }
}

export default App;

// https://neweralive.na/storage/images/2023/may/lloyd-sikeba.jpg
