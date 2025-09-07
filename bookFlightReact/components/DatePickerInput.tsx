import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet, Platform, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import React, { useState } from 'react';

type DatePickerInputProps = {
  dateType: string;
  handleChange: (type: string) => (value: string) => void;
  placeholderText: string;
  dateValue: string;
};

const DatePickerInput = ({
  handleChange,
  placeholderText,
  dateValue,
  dateType,
}: DatePickerInputProps) => {
  const isWeb = Platform.OS === 'web';
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <>
      {isWeb ? (
        <input
          type="date"
          value={dateValue || ''}
          onChange={e => handleChange(dateType)(e.target.value)}
          placeholder={placeholderText}
          style={{
            padding: "7px 10px",
            border: "1px solid #e2e2e2",
            borderRadius: 8,
            background: "#fff",
            fontSize: 13,
            color: "#222",
            outline: "none",
            width: "100%",
            height: 30,
            marginBottom: 12, // outside space for web
          }}
        />
      ) : (
        <View style={styles.halfInput}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              mode="flat"
              style={styles.input}
              value={dateValue ? new Date(dateValue).toLocaleDateString() : ""}
              placeholder={placeholderText}
              editable={false}
              underlineColor="transparent"
              pointerEvents="none"
              right={
                <TextInput.Icon
                  icon="calendar"
                  size={16}
                  color="#888"
                />
              }
              theme={{
                colors: {
                  background: "#fff",
                  text: "#222",
                  placeholder: "#999",
                },
              }}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateValue ? new Date(dateValue) : new Date()}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  handleChange(dateType)(selectedDate.toISOString().split('T')[0]);
                }
              }}
            />
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderColor: "#e2e2e2",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 13,
    height: 30,
    paddingHorizontal: 10,
    color: "#222",
    marginTop: 6, // inside spacing
  },
  halfInput: {
    flex: 1,
    minWidth: 0,
    height: 25,
    marginBottom: 12, // ⬅️ outside spacing
  },
});

export default DatePickerInput;
