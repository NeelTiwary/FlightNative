import { useAppContext } from "@/context/AppContextProvider";
import { theme } from "@/themes/theme";
import { StyleSheet, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import MenuDropdown from "./MenuDropdown";

type TravelerFormType = {
    traveler: any,
    handleChange: (field: string, index: number) => (value: string) => void,
    index: number,
    genderOptions: string[],
    documentTypeOptions: string[],
    countryCallingCodes: string[]
}
export default function TravelerForm({
    traveler, 
    handleChange, 
    index, 
    genderOptions, 
    documentTypeOptions, 
    countryCallingCodes
}: TravelerFormType) {
    const { countriesData } = useAppContext();
    return (
        <View>
            <TextInput
                label="First Name"
                mode="flat"
                value={traveler.firstName}
                onChangeText={(text) => handleChange('firstName', index)(text)}
                style={styles.input}
            />
            <TextInput
                label="Last Name"
                mode="flat"
                value={traveler.lastName}
                onChangeText={(text) => handleChange('lastName', index)(text)}
                style={styles.input}
            />

                <RadioButton.Group
                onValueChange={(value) => handleChange('gender', index)(value)}
                value={traveler.gender}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    {
                        genderOptions.map((option: string, index: number) => (
                            <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <RadioButton value={option} />
                                <Button style={{ marginStart: -15 }}>{option}</Button>
                            </View>
                        ))
                    }
                </View>
            </RadioButton.Group>
            <TextInput
                label="Email"
                mode="flat"
                value={traveler.email}
                onChangeText={(text) => handleChange('email', index)(text)}
                style={styles.input}
            />
            <DatePickerInput
                // showDatePicker={showDatePicker}
                // setShowDatePicker={setShowDatePicker}
                handleChange={(type: string) => (value: string) => handleChange(type, index)(value)}
                placeholderText="Date of Birth"
                dateValue={traveler.dateOfBirth ? new Date(traveler.dateOfBirth).toDateString() : ""}
                dateType='dateOfBirth'                     
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10, alignItems: 'center' }}>
                <View style={{ flex: 2 }}>
                    <MenuDropdown
                        items={countriesData.map((c: any) => `${c.idd.root}${c.idd.suffixes.map((s: string) => s).join('')}`)}
                        selectedItem={traveler.phoneNumber.countryCallingCode}
                        label="Code"
                        type="phoneNumber.countryCallingCode"
                        handleChange={(type) => (val) => handleChange(type, index)(val)}
                        styles={{
                            marginTop: 45
                        }}
                    />
                </View>
                <View style={{ flex: 7 }}>
                    <TextInput
                        label="Phone Number"
                        mode="flat"
                        value={traveler.phoneNumber.number}
                        onChangeText={(text) => handleChange('phoneNumber.number', index)(text)}
                        style={{ backgroundColor: theme.colors.transparent}}
                    />
                </View>
            </View>
            <MenuDropdown 
                items={documentTypeOptions}
                selectedItem={traveler.document.documentType}
                label="Type of Document"
                type="document.documentType"
                handleChange={(type) => (val) => handleChange(type, index)(val)}
                styles={{
                    marginTop: 45
                }}
            />

            <TextInput
                label="Birth Place"
                mode="flat"
                value={traveler.document.birthPlace}
                onChangeText={(text) => handleChange('document.birthPlace', index)(text)}
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Ex - Delhi"
            />
            <TextInput
                label="Issuance Location"
                mode="flat"
                value={traveler.document.issuanceLocation}
                onChangeText={(text) => handleChange('document.issuanceLocation', index)(text)}
                style={styles.input}
                placeholder="Ex - Delhi"
            />
            <TextInput
                label="ID Number"
                mode="flat"
                value={traveler.document.number}
                onChangeText={(text) => handleChange('document.number', index)(text)}
                style={styles.input}
            />
            <DatePickerInput
                handleChange={(type: string) => (value: string) => handleChange(type, index)(value)}
                placeholderText="Issuance Date"
                dateValue={traveler.document.issuanceDate ? new Date(traveler.document.issuanceDate).toDateString() : ""}
                dateType='document.issuanceDate'                     
            />
            <DatePickerInput
                handleChange={(type: string) => (value: string) => handleChange(type, index)(value)}
                placeholderText="Expiry Date"
                dateValue={traveler.document.expiryDate ? new Date(traveler.document.expiryDate).toDateString() : ""}
                dateType='document.expiryDate'                     
            />
            <TextInput
                label="Issuance Country"
                mode="flat"
                value={traveler.document.issuanceCountry}
                onChangeText={(text) => handleChange('document.issuanceCountry', index)(text)}
                style={styles.input}
                placeholder="ISO Code - IN, US"
            />
            <TextInput
                label="Validity Country"
                mode="flat"
                value={traveler.document.validityCountry}
                onChangeText={(text) => handleChange('document.validityCountry', index)(text)}
                style={styles.input}
                placeholder="ISO Code - IN, US"
            />
            <TextInput
                label="Nationality"
                mode="flat"
                value={traveler.document.nationality}
                onChangeText={(text) => handleChange('document.nationality', index)(text)}
                style={styles.input}
                placeholder="ISO Code - IN, US"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 10,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderRadius: 1,
        backgroundColor: theme.colors.transparent
    }
})