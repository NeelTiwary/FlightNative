import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { TextInput, Text, Divider } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import MenuDropdown from "./MenuDropdown";
import { theme } from "@/themes/theme";
import { useAppContext } from "@/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phoneNumber: { countryCallingCode: string; number: string };
  document: {
    documentType: string;
    number: string;
    expiryDate: string;
    issuanceDate: string;
    issuanceCountry: string;
    validityCountry: string;
    nationality: string;
    birthPlace: string;
    issuanceLocation: string;
    holder: boolean;
  };
}

type Props = {
  traveler: Traveler;
  index: number;
  handleChange: (field: string, index: number) => (value: string) => void;
  genderOptions: string[];
  documentTypeOptions: string[];
  countryCallingCodes: string[];
};

export default function TravelerForm({
  traveler,
  index,
  handleChange,
  genderOptions,
  documentTypeOptions,
  countryCallingCodes,
}: Props) {
  const { countriesData } = useAppContext();
  const [activeTab, setActiveTab] = useState("personal");

  const TabButton = ({ title, tabKey, icon }) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === tabKey && styles.activeTab]} 
      onPress={() => setActiveTab(tabKey)}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={16} 
        color={activeTab === tabKey ? "#2563EB" : "#64748B"} 
      />
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton title="Personal" tabKey="personal" icon="account" />
        <TabButton title="Document" tabKey="document" icon="passport" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "personal" && (
          <View style={styles.tabContent}>
            <View style={styles.row}>
              <TextInput
                label="First Name"
                mode="flat"
                value={traveler.firstName || ""}
                onChangeText={(text) => handleChange("firstName", index)(text)}
                style={[styles.input, styles.halfInput]}
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
              <TextInput
                label="Last Name"
                mode="flat"
                value={traveler.lastName || ""}
                onChangeText={(text) => handleChange("lastName", index)(text)}
                style={[styles.input, styles.halfInput]}
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Email"
                mode="flat"
                keyboardType="email-address"
                autoCapitalize="none"
                value={traveler.email || ""}
                onChangeText={(text) => handleChange("email", index)(text)}
                style={[styles.input, styles.halfInput]}
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
              <DatePickerInput
                handleChange={(type) => (value) => handleChange(type, index)(value)}
                placeholderText="Date of Birth"
                dateValue={traveler.dob ? new Date(traveler.dob).toDateString() : ""}
                dateType="dob"
                style={[styles.input, styles.halfInput]}
                compact
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.thirdInput, { marginRight: 8 }]}>
                <MenuDropdown
                  items={countryCallingCodes}
                  selectedItem={traveler.phoneNumber?.countryCallingCode || ""}
                  label="Code"
                  type="phoneNumber.countryCallingCode"
                  handleChange={(type) => (val) => handleChange(type, index)(val)}
                  compact
                />
              </View>
              <TextInput
                label="Phone Number"
                mode="flat"
                keyboardType="phone-pad"
                value={traveler.phoneNumber?.number || ""}
                onChangeText={(text) => handleChange("phoneNumber.number", index)(text)}
                style={[styles.input, { flex: 2 }]}
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
            </View>

            <View style={styles.genderContainer}>
              <Text style={styles.sectionLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {genderOptions.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.genderOption,
                      traveler.gender === option && styles.genderOptionSelected
                    ]}
                    onPress={() => handleChange("gender", index)(option)}
                  >
                    <Text style={[
                      styles.genderText,
                      traveler.gender === option && styles.genderTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === "document" && (
          <View style={styles.tabContent}>
            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: 8 }]}>
                <MenuDropdown
                  items={documentTypeOptions}
                  selectedItem={traveler.document?.documentType || ""}
                  label="Document Type"
                  type="document.documentType"
                  handleChange={(type) => (val) => handleChange(type, index)(val)}
                  compact
                />
              </View>
              <TextInput
                label="Document Number"
                mode="flat"
                value={traveler.document?.number || ""}
                onChangeText={(text) => handleChange("document.number", index)(text)}
                style={[styles.input, styles.halfInput]}
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: 8 }]}>
                <DatePickerInput
                  handleChange={(type) => (value) => handleChange(type, index)(value)}
                  placeholderText="Issuance Date"
                  dateValue={traveler.document?.issuanceDate ? new Date(traveler.document.issuanceDate).toDateString() : ""}
                  dateType="document.issuanceDate"
                  compact
                />
              </View>
              <View style={styles.halfInput}>
                <DatePickerInput
                  handleChange={(type) => (value) => handleChange(type, index)(value)}
                  placeholderText="Expiry Date"
                  dateValue={traveler.document?.expiryDate ? new Date(traveler.document.expiryDate).toDateString() : ""}
                  dateType="document.expiryDate"
                  compact
                />
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Birth Place"
                mode="flat"
                value={traveler.document?.birthPlace || ""}
                onChangeText={(text) => handleChange("document.birthPlace", index)(text)}
                style={[styles.input, styles.halfInput]}
                placeholder="e.g., Delhi"
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
              <TextInput
                label="Issuance Location"
                mode="flat"
                value={traveler.document?.issuanceLocation || ""}
                onChangeText={(text) => handleChange("document.issuanceLocation", index)(text)}
                style={[styles.input, styles.halfInput]}
                placeholder="e.g., Delhi"
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Issuance Country"
                mode="flat"
                value={traveler.document?.issuanceCountry || ""}
                onChangeText={(text) => handleChange("document.issuanceCountry", index)(text)}
                style={[styles.input, styles.thirdInput]}
                placeholder="ISO Code"
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
              <TextInput
                label="Validity Country"
                mode="flat"
                value={traveler.document?.validityCountry || ""}
                onChangeText={(text) => handleChange("document.validityCountry", index)(text)}
                style={[styles.input, styles.thirdInput]}
                placeholder="ISO Code"
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
              <TextInput
                label="Nationality"
                mode="flat"
                value={traveler.document?.nationality || ""}
                onChangeText={(text) => handleChange("document.nationality", index)(text)}
                style={[styles.input, styles.thirdInput]}
                placeholder="ISO Code"
                dense
                underlineColor="transparent"
                theme={{ colors: { primary: '#2563EB' } }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  tabContent: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 5,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  genderContainer: {
    marginTop: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 4,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  genderOptionSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genderText: {
    fontSize: 14,
    color: '#64748B',
  },
  genderTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
});