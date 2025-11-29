import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StockCard } from '../stock-card';

interface StockGridProps {
  totalStones: number;
  inStock: number;
  sold: number;
  pending: number;
}

export const StockGrid: React.FC<StockGridProps> = ({
  totalStones,
  inStock,
  sold,
  pending
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StockCard
          title="Total Stones"
          value={totalStones}
          iconName="diamond-stone"
          style={StyleSheet.flatten([styles.card, {backgroundColor: '#FFFFFF'}])}
          textStyle={{color: '#fff'}}
          gradientColors={['#6366f1', '#8b5cf6']}
        />
        <StockCard
          title="In Stock"
          value={inStock}
          iconName="package-variant"
          style={styles.card}
          gradientColors={['#10b981', '#059669']}
        />
      </View>
      <View style={styles.row}>
        <StockCard
          title="Sold"
          value={sold}
          iconName="cash"
          style={styles.card}
          gradientColors={['#ef4444', '#dc2626']} 
        />
        <StockCard
          title="Pending"
          value={pending}
          iconName="clock-outline"
          style={styles.card}
          gradientColors={['#f59e0b', '#d97706']} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});