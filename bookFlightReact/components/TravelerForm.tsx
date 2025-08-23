import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { RadioButton, TextInput, Button } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import MenuDropdown from "./MenuDropdown";
import { theme } from "@/themes/theme";
import { useAppContext } from "@/context/AppContextProvider";

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <TextInput
          label="First Name *"
          mode="flat"
          value={traveler.firstName || ""}
          onChangeText={(text) => handleChange("firstName", index)(text)}
          style={styles.input}
        />
        <TextInput
          label="Last Name *"
          mode="flat"
          value={traveler.lastName || ""}
          onChangeText={(text) => handleChange("lastName", index)(text)}
          style={styles.input}
        />
        <RadioButton.Group
          onValueChange={(value) => handleChange("gender", index)(value)}
          value={traveler.gender || ""}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            {genderOptions.map((option, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center" }}>
                <RadioButton value={option} />
                <Button style={{ marginStart: -15 }}>{option}</Button>
              </View>
            ))}
          </View>
        </RadioButton.Group>
        <TextInput
          label="Email *"
          mode="flat"
          keyboardType="email-address"
          autoCapitalize="none"
          value={traveler.email || ""}
          onChangeText={(text) => handleChange("email", index)(text)}
          style={styles.input}
        />
        <DatePickerInput
          handleChange={(type) => (value) => handleChange(type, index)(value)}
          placeholderText="Date of Birth *"
          dateValue={traveler.dob ? new Date(traveler.dob).toDateString() : ""}
          dateType="dob"
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 10, alignItems: "center" }}>
          <View style={{ flex: 2 }}>
            <MenuDropdown
              items={countryCallingCodes}
              selectedItem={traveler.phoneNumber?.countryCallingCode || ""}
              label="Code *"
              type="phoneNumber.countryCallingCode"
              handleChange={(type) => (val) => handleChange(type, index)(val)}
              styles={{ marginTop: 45 }}
            />
          </View>
          <View style={{ flex: 7 }}>
            <TextInput
              label="Phone Number *"
              mode="flat"
              keyboardType="phone-pad"
              value={traveler.phoneNumber?.number || ""}
              onChangeText={(text) => handleChange("phoneNumber.number", index)(text)}
              style={{ backgroundColor: theme.colors.transparent }}
            />
          </View>
        </View>
        <MenuDropdown
          items={documentTypeOptions}
          selectedItem={traveler.document?.documentType || ""}
          label="Type of Document *"
          type="document.documentType"
          handleChange={(type) => (val) => handleChange(type, index)(val)}
          styles={{ marginTop: 45 }}
        />
        <TextInput
          label="Document Number *"
          mode="flat"
          value={traveler.document?.number || ""}
          onChangeText={(text) => handleChange("document.number", index)(text)}
          style={[styles.input, { marginTop: 10 }]}
        />
        <DatePickerInput
          handleChange={(type) => (value) => handleChange(type, index)(value)}
          placeholderText="Issuance Date *"
          dateValue={traveler.document?.issuanceDate ? new Date(traveler.document.issuanceDate).toDateString() : ""}
          dateType="document.issuanceDate"
        />
        <DatePickerInput
          handleChange={(type) => (value) => handleChange(type, index)(value)}
          placeholderText="Expiry Date *"
          dateValue={traveler.document?.expiryDate ? new Date(traveler.document.expiryDate).toDateString() : ""}
          dateType="document.expiryDate"
        />
        <TextInput
          label="Birth Place *"
          mode="flat"
          value={traveler.document?.birthPlace || ""}
          onChangeText={(text) => handleChange("document.birthPlace", index)(text)}
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Ex - Delhi"
        />
        <TextInput
          label="Issuance Location *"
          mode="flat"
          value={traveler.document?.issuanceLocation || ""}
          onChangeText={(text) => handleChange("document.issuanceLocation", index)(text)}
          style={styles.input}
          placeholder="Ex - Delhi"
        />
        <TextInput
          label="Issuance Country *"
          mode="flat"
          value={traveler.document?.issuanceCountry || ""}
          onChangeText={(text) => handleChange("document.issuanceCountry", index)(text)}
          style={styles.input}
          placeholder="ISO Code - IN, US"
        />
        <TextInput
          label="Validity Country *"
          mode="flat"
          value={traveler.document?.validityCountry || ""}
          onChangeText={(text) => handleChange("document.validityCountry", index)(text)}
          style={styles.input}
          placeholder="ISO Code - IN, US"
        />
        <TextInput
          label="Nationality *"
          mode="flat"
          value={traveler.document?.nationality || ""}
          onChangeText={(text) => handleChange("document.nationality", index)(text)}
          style={styles.input}
          placeholder="ISO Code - IN, US"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  input: {
    marginBottom: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 1,
    backgroundColor: theme.colors.transparent,
  },
});