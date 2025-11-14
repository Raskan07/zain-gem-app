import {
    Button,
    ButtonIcon,
    ButtonText,
    ChevronDownIcon,
    Menu,
    MenuItem,
    MenuItemLabel
} from '@gluestack-ui/themed';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterButtonsProps {
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
  onDownload: () => void;
}

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'In Stock' },
  { label: 'Sold', value: 'Sold' },
  { label: 'In Process', value: 'In Process' },
];

const gemTypes = [
  { label: 'All', value: 'all' },
  { label: 'Sapphire', value: 'Sapphire' },
  { label: 'Ruby', value: 'Ruby' },
  { label: 'Emerald', value: 'Emerald' },
  { label: 'Diamond', value: 'Diamond' },
];

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  onStatusChange,
  onTypeChange,
  onDownload,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0].label);
  const [selectedType, setSelectedType] = useState(gemTypes[0].label);

  return (
    <View style={styles.container}>
      {/* Status Menu */}
      <View style={styles.menuContainer}>
        <Menu
          placement="bottom"
          trigger={({ ...triggerProps }) => (
            <Button
              {...triggerProps}
              variant="outline"
              style={styles.menuButton}
            >
              <ButtonText style={styles.buttonText}>{selectedStatus}</ButtonText>
              <ButtonIcon as={ChevronDownIcon} ml="$2" color="$white" />
            </Button>
          )}
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              onPress={() => {
                setSelectedStatus(option.label);
                onStatusChange(option.value);
              }}
            >
              <MenuItemLabel>{option.label}</MenuItemLabel>
            </MenuItem>
          ))}
        </Menu>
      </View>

      {/* Type Menu */}
      <View style={styles.menuContainer}>
        <Menu
          placement="bottom"
          trigger={({ ...triggerProps }) => (
            <Button
              {...triggerProps}
              variant="outline"
              style={styles.menuButton}
            >
              <ButtonText style={styles.buttonText}>{selectedType}</ButtonText>
              <ButtonIcon as={ChevronDownIcon} ml="$2" color="$white" />
            </Button>
          )}
        >
          {gemTypes.map((type) => (
            <MenuItem
              key={type.value}
              onPress={() => {
                setSelectedType(type.label);
                onTypeChange(type.value);
              }}
            >
              <MenuItemLabel>{type.label}</MenuItemLabel>
            </MenuItem>
          ))}
        </Menu>
      </View>

      {/* Download Button */}
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={onDownload}
      >
        <Text style={styles.downloadText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuContainer: {
    flex: 1,
  },
  menuButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  downloadButton: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});