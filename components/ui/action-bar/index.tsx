import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ActionButton } from '../action-button';

interface ActionBarProps {
  style?: ViewStyle;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  style,
  onDeposit,
  onWithdraw,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActionButton
        title="Deposit"
        onPress={onDeposit || (() => {})}
        style={styles.depositButton}
      />
      <ActionButton
        title="Withdraw"
        onPress={onWithdraw || (() => {})}
        variant="secondary"
        style={styles.withdrawButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  depositButton: {
    flex: 1,
  },
  withdrawButton: {
    flex: 1,
  },
});