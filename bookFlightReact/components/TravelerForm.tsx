import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import MenuDropdown from "./MenuDropdown";
import { useAppContext } from "@/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const { width } = Dimensions.get('window');

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

// Move InputField outside the main component to prevent re-renders
const InputField = ({ label, value, onChange, type = "default", style = {}, onFocus, onBlur, ...props }) => (
  <TextInput
    label={label}
    mode="outlined"
    value={value || ""}
    onChangeText={onChange}
    style={[styles.input, style]}
    dense
    outlineColor="#E2E8F0"
    activeOutlineColor="#4A6CFA"
    keyboardType={type}
    autoCapitalize={type === "email-address" ? "none" : "words"}
    theme={{ 
      colors: { 
        background: '#FFFFFF',
        onSurfaceVariant: '#94A3B8',
        text: '#1E293B'
      },
      roundness: 6,
    }}
    onFocus={onFocus}
    onBlur={onBlur}
    {...props}
  />
);

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [tabIndicator] = useState(new Animated.Value(0));

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    Keyboard.dismiss();
    Animated.spring(tabIndicator, {
      toValue: tabKey === "personal" ? 0 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0
    }).start();
  };

  const translateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2]
  });

  const TabButton = ({ title, tabKey, icon }) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === tabKey && styles.activeTab]} 
      onPress={() => handleTabChange(tabKey)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={16} 
        color={activeTab === tabKey ? "#4A6CFA" : "#94A3B8"} 
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Header with Title and Tabs */}
        <View style={styles.header}>
          <View style={styles.tabContainer}>
            <TabButton title="Personal Info" tabKey="personal" icon="account-outline" />
            <TabButton title="Document" tabKey="document" icon="passport" />
            <Animated.View 
              style={[
                styles.tabIndicator,
                { transform: [{ translateX }] }
              ]} 
            />
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "personal" && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-details" size={14} color="#4A6CFA" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                <View style={styles.row}>
                  <InputField
                    label="First Name"
                    value={traveler.firstName}
                    onChange={(text) => handleChange("firstName", index)(text)}
                    style={styles.halfInput}
                    onFocus={() => handleFocus("First Name")}
                    onBlur={handleBlur}
                  />
                  <View style={styles.spacer} />
                  <InputField
                    label="Last Name"
                    value={traveler.lastName}
                    onChange={(text) => handleChange("lastName", index)(text)}
                    style={styles.halfInput}
                    onFocus={() => handleFocus("Last Name")}
                    onBlur={handleBlur}
                  />
                </View>
                {/* Email, DOB, and Gender in single row */}
                <InputField
                    label="Email"
                    value={traveler.email}
                    onChange={(text) => handleChange("email", index)(text)}
                    type="email-address"
                    style={styles.halfInput}
                    onFocus={() => handleFocus("Email")}
                    onBlur={handleBlur}
                  />
                <View style={styles.row}>
                  <View style={styles.spacer} />
                  <View style={styles.halfInput}>
                    <DatePickerInput
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                      placeholderText="DOB"
                      dateValue={traveler.dob || ""}
                      dateType="dob"
                    />
                  </View>
                  <View style={styles.spacer} />
                  <View style={styles.halfInput}>
                    <MenuDropdown
                      items={genderOptions}
                      selectedItem={traveler.gender || ""}
                      label="Gender"
                      type="gender"
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                    />
                  </View>
                </View>
                {/* END Email/DOB/Gender Row */}
                <View style={styles.row}>
                  <View style={[styles.thirdInput]}>
                    <MenuDropdown
                      items={countryCallingCodes}
                      selectedItem={traveler.phoneNumber?.countryCallingCode || ""}
                      label="Code"
                      type="phoneNumber.countryCallingCode"
                      handleChange={(type) => (val) => handleChange(type, index)(val)}
                    />
                  </View>
                  <View style={styles.spacer} />
                  <InputField
                    label="Phone Number"
                    value={traveler.phoneNumber?.number}
                    onChange={(text) => handleChange("phoneNumber.number", index)(text)}
                    type="phone-pad"
                    style={{ flex: 2 }}
                    onFocus={() => handleFocus("Phone Number")}
                    onBlur={handleBlur}
                  />
                </View>
              </View>
            )}
            {activeTab === "document" && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="file-document" size={14} color="#4A6CFA" />
                  <Text style={styles.sectionTitle}>Document Details</Text>
                </View>
                <View style={styles.row}>
                  <View style={[styles.halfInput]}>
                    <MenuDropdown
                      items={documentTypeOptions}
                      selectedItem={traveler.document?.documentType || ""}
                      label="Document Type"
                      type="document.documentType"
                      handleChange={(type) => (val) => handleChange(type, index)(val)}
                    />
                  </View>
                  <View style={styles.spacer} />
                  <InputField
                    label="Document Number"
                    value={traveler.document?.number}
                    onChange={(text) => handleChange("document.number", index)(text)}
                    style={styles.halfInput}
                    onFocus={() => handleFocus("Document Number")}
                    onBlur={handleBlur}
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.halfInput]}>
                    <DatePickerInput
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                      placeholderText="Issuance Date"
                      dateValue={traveler.document?.issuanceDate || ""}
                      dateType="document.issuanceDate"
                    />
                  </View>
                  <View style={styles.spacer} />
                  <View style={styles.halfInput}>
                    <DatePickerInput
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                      placeholderText="Expiry Date"
                      dateValue={traveler.document?.expiryDate || ""}
                      dateType="document.expiryDate"
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <InputField
                    label="Birth Place"
                    value={traveler.document?.birthPlace}
                    onChange={(text) => handleChange("document.birthPlace", index)(text)}
                    placeholder="e.g., Delhi"
                    style={styles.halfInput}
                    onFocus={() => handleFocus("Birth Place")}
                    onBlur={handleBlur}
                  />
                  <View style={styles.spacer} />
                  <InputField
                    label="Issuance Location"
                    value={traveler.document?.issuanceLocation}
                    onChange={(text) => handleChange("document.issuanceLocation", index)(text)}
                    placeholder="e.g., Delhi"
                    style={styles.halfInput}
                    onFocus={() => handleFocus("Issuance Location")}
                    onBlur={handleBlur}
                  />
                </View>
                <View style={styles.row}>
                  <InputField
                    label="Issuance Country"
                    value={traveler.document?.issuanceCountry}
                    onChange={(text) => handleChange("document.issuanceCountry", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                    onFocus={() => handleFocus("Issuance Country")}
                    onBlur={handleBlur}
                  />
                  <View style={styles.spacer} />
                  <InputField
                    label="Validity Country"
                    value={traveler.document?.validityCountry}
                    onChange={(text) => handleChange("document.validityCountry", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                    onFocus={() => handleFocus("Validity Country")}
                    onBlur={handleBlur}
                  />
                  <View style={styles.spacer} />
                  <InputField
                    label="Nationality"
                    value={traveler.document?.nationality}
                    onChange={(text) => handleChange("document.nationality", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                    onFocus={() => handleFocus("Nationality")}
                    onBlur={handleBlur}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  titleUnderline: {
    height: 2,
    width: 22,
    backgroundColor: '#4A6CFA',
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 2,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    zIndex: 2,
    minHeight: 28,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    top: '15%',
    left: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A6CFA',
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 18,
  },
  tabContent: {
    gap: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  spacer: {
    width: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 12,
    height: 25,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginVertical: 0,
  },
  halfInput: {
    flex: 1,
    minWidth: 0,
    height: 25,
  },
  thirdInput: {
    flex: 1,
    height: 25,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3b68b1ff',
    marginLeft: 4,
  }
});