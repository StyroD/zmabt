import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/color'
import { ProfileBox } from '../../components/Dashboard/ProfileBox';
import { InfoBox } from '../../components/Dashboard/InfoBox';
export default function Dashboard() {

  const isManager = true;
  const name = "Peter Novak";
  const status = "Online"
  const totaljobs = 10;
  const activejobs = 3;
  const pendingjobs = 6;
  const certificates = 7;
  const workers = 20;


  return (
    <View style={styles.container}>


      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.screen}>
        <ProfileBox name={name} role={isManager} status={status}/>
      </View>

      {isManager ? (
        <InfoBox isManager={true} totaljobs={totaljobs} activejobs={activejobs} pendingjobs={pendingjobs} workers={workers}></InfoBox>
      ) : (
        <InfoBox isManager={false} activejobs={activejobs} certificates={certificates}></InfoBox>
      )}
      
    </View>
   
  )
}

const styles = StyleSheet.create({
  screen:{
    alignItems: 'center',
    flex: 1
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
  }
})