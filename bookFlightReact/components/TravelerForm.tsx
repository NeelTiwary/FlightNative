import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { RadioButton, Text, TextInput, IconButton } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import { theme } from "@/themes/theme";

export interface Traveler {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  passport: string;
  email: string;
  phoneNumber: { countryCallingCode: string; number: string };
}

type Props = {
  traveler: Traveler;
  index: number;
  handleChange: (fieldPath: string, index: number) => (value: string) => void;
  handleAddTraveler: () => void;
  genderOptions: string[];
  countryCallingCodes: string[];
  isLastTraveler: boolean;
};

export default function TravelerForm({
  traveler,
  index,
  handleChange,
  handleAddTraveler,
  genderOptions,
  countryCallingCodes,
  isLastTraveler,
}: Props) {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerText}>
            Traveler {index + 1} Details
          </Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Name Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            PERSONAL INFORMATION
          </Text>
          <View style={styles.row}>
            <View style={[styles.column, { flex: 1, marginRight: 8 }]}>
              <TextInput
                label="First Name *"
                value={traveler.firstName}
                onChangeText={(t) => handleChange("firstName", index)(t)}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.column, { flex: 1 }]}>
              <TextInput
                label="Last Name *"
                value={traveler.lastName}
                onChangeText={(t) => handleChange("lastName", index)(t)}
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <DatePickerInput
            placeholderText="Date of Birth *"
            dateValue={traveler.dob ? new Date(traveler.dob).toDateString() : ""}
            dateType="dob"
            handleChange={(t) => (v) => handleChange(t, index)(v)}
          />
        </View>

        {/* Gender Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            GENDER
          </Text>
          <RadioButton.Group
            onValueChange={(v) => handleChange("gender", index)(v)}
            value={traveler.gender}
          >
            <View style={styles.radioGroup}>
              {genderOptions.map((g) => (
                <View key={g} style={styles.radioItem}>
                  <RadioButton 
                    value={g} 
                    color={theme.colors.primary}
                    uncheckedColor="#9E9E9E"
                  />
                  <Text variant="bodyMedium" style={styles.radioLabel}>{g}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        </View>

        {/* Passport Number */}
        <View style={styles.section}>
          <TextInput
            label="Passport Number (Optional)"
            value={traveler.passport}
            onChangeText={(t) => handleChange("passport", index)(t)}
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
          />
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            CONTACT INFORMATION
          </Text>
          
          <TextInput
            label="Email Address *"
            keyboardType="email-address"
            autoCapitalize="none"
            value={traveler.email}
            onChangeText={(t) => handleChange("email", index)(t)}
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
          />

          {/* Phone number */}
          <View style={styles.phoneSection}>
            <Text variant="bodyMedium" style={styles.phoneLabel}>
              Phone Number *
            </Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeContainer}>
                <TextInput
                  label="Code"
                  value={traveler.phoneNumber.countryCallingCode}
                  onChangeText={(t) => handleChange("phoneNumber.countryCallingCode", index)(t)}
                  style={styles.countryCodeInput}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.phoneInputContainer}>
                <TextInput
                  label="Phone Number"
                  keyboardType="phone-pad"
                  value={traveler.phoneNumber.number}
                  onChangeText={(t) => handleChange("phoneNumber.number", index)(t)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Traveler Button - Only show for the last traveler */}
      {isLastTraveler && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTraveler}
          activeOpacity={0.8}
        >
          <IconButton
            icon="plus"
            size={24}
            iconColor="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add Traveler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    color: '#212121',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerDivider: {
    height: 2,
    backgroundColor: theme.colors.primary,
    width: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#616161',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  column: {
    flexDirection: "column",
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  radioLabel: {
    color: '#424242',
    marginLeft: 4,
  },
  phoneSection: {
    marginTop: 4,
  },
  phoneLabel: {
    color: '#616161',
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeContainer: {
    flex: 3,
    marginRight: 8,
  },
  countryCodeInput: {
    backgroundColor: '#FFFFFF',
  },
  phoneInputContainer: {
    flex: 7,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
  },
});