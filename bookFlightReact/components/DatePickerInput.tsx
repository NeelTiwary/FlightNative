import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

import { useState } from 'react';
import { Platform } from 'react-native';


type DatePickerInputProps = {
    // searchParams: any;
    dateType: string;
    handleChange: any;
    placeholderText: string;
    dateValue: string;
}

const DatePickerInput = ({
    // searchParams,
    handleChange,
    placeholderText,
    dateValue,
    dateType
}: DatePickerInputProps) => {
    const isWeb = Platform.OS === 'web'; 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    return (
        <>
            {
                isWeb ? (
                     <input
                        type="date"
                        value={dateValue || ''}
                        onChange={(e) => handleChange(dateType)(e.target.value)}
                        placeholder={placeholderText}
                        style={{ padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
                    />
                ) : (
                    <>
                        <TextInput
                            mode="flat" 
                            style={styles.input} 
                            onPressIn={() => setShowDatePicker(true)}
                            onFocus={() => setShowDatePicker(true)}
                            value={dateValue ? new Date(dateValue).toLocaleDateString() : ''}
                            placeholder={placeholderText}
                            editable={false}
                            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                        />
                        {showDatePicker && (
                            <DateTimePicker
                            // value={searchParams["dateType"] ? new Date(searchParams["dateType"]) : new Date()}
                            value={dateValue ? new Date(dateValue) : new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    // console.log("Selected Date: ", selectedDate);
                                    setSelectedDate(selectedDate);
                                    handleChange(dateType)(selectedDate.toISOString().split('T')[0]);
                                }
                            }}
                            />
                        )}
                    </>
                )
            }
        </>
    )
}


const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    input: {
      marginBottom: 16,
      backgroundColor: "#ffffff02",
    }
});

export default DatePickerInput;