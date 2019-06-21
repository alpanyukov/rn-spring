import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';

export class App extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Box />
      </SafeAreaView>
    );
  }
}

const Box: React.FC<{}> = () => <View style={styles.box} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

    backgroundColor: '#41b3a3',
    width: 120,
    height: 120
  }
});
