import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TransactionItemProps {
  title: string;
  subtitle: string;
  amount: string;
  type: 'deposit' | 'withdraw' | 'auto';
  date?: string;
  style?: ViewStyle;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  title,
  subtitle,
  amount,
  type,
  date,
  style
}) => {
  const getIcon = () => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-circle';
      case 'withdraw':
        return 'arrow-up-circle';
      case 'auto':
        return 'clock';
      default:
        return 'circle';
    }
  };

  const isPositive = type === 'deposit' || type === 'auto';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Feather name={getIcon()} size={24} color={isPositive ? '#00D492' : '#FF4444'} />
      </View>
      <View style={styles.contentContainer}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isPositive ? '#00D492' : '#FF4444' }]}>
            {isPositive ? '+' : '-'}{amount}
          </Text>
          {date && <Text style={styles.date}>{date}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#999999',
    fontSize: 13,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#999999',
    fontSize: 12,
    marginTop: 2,
  },
});