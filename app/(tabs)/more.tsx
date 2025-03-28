import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function MoreScreen() {
  const colors = Colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <MaterialIcons name="more-horiz" size={64} color={colors.muted} />
        <Text style={[styles.title, { color: colors.text }]}>
          Дополнительные функции
        </Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          Эта страница должна открываться в виде модального окна.
          Если вы видите этот экран, возможно произошла ошибка.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%'
  }
}); 