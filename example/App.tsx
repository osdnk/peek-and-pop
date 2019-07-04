import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import PeekAndPop from 'react-native-peek-and-pop';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <PeekAndPop
          renderPreview={() => (
            <View
              style={{ width: 100, height: 100, backgroundColor: 'blue' }}
            />
          )}
          onPeek={() => console.log('onPeek')}
          onPop={() => console.warn('pop')}
          onDisappear={() => console.log('onDisappear')}
          previewActions={[
            {
              type: 'destructive',
              caption: 'remove',
              action: () => console.warn('1'),
            },
            {
              type: 'destructive',
              caption: 'remove2',
              action: () => console.warn('2'),
            },
            {
              caption: 'group',
              group: [
                {
                  type: 'selected',
                  caption: 'selected',
                  action: () => console.warn('3'),
                },
                {
                  type: 'selected',
                  caption: 'selected2',
                  action: () => console.warn('4'),
                },
              ],
            },
          ]}
        >
          <View
            style={{
              backgroundColor: 'red',
              width: 130,
              height: 130,
            }}
          />
        </PeekAndPop>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b0b0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabbar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    borderColor: 'black',
  },
});

export default App;
