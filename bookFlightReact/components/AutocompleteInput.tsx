import { theme } from "@/themes/theme";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, List, TextInput } from "react-native-paper";

type OptionType = {
    iata: string;
    name: string;
    city?: string;
    country_code: string;
    subType?: string;
    groupData?: any;
};

type AutocompleteInputProps = {
    options: OptionType[];
    inputLabel: string;
    inputValue: string;
    onInputChange: (text: string) => void;
    onSelectOption: (option: OptionType) => void;
    loading?: boolean;
    icon?: string;
    inputStyle?: any;
};

const AutocompleteInput = ({
    options,
    inputLabel,
    inputValue,
    onInputChange,
    onSelectOption,
    loading,
    icon,
    inputStyle
}: AutocompleteInputProps) => {
    const [showOptions, setShowOptions] = useState(false);

    const handleSelect = (option: OptionType) => {
        onSelectOption(option);
        setShowOptions(false);
    }

    return (
        <View style={styles.container}>
            <TextInput
                label={inputLabel}
                value={inputValue}
                onChangeText={(text) => {
                    onInputChange(text);
                    setShowOptions(true);
                }}
                left={<TextInput.Icon icon={icon || "airplane"} />}
                right={loading ? <TextInput.Icon icon={() => <ActivityIndicator />} /> : <TextInput.Icon icon="" onPress={() => setShowOptions(!showOptions)} />}
                style={[inputStyle, { width: "100%" }]}
                mode="flat"
            />
            {
                showOptions && options.length > 0 && (
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.iata}
                        style={styles.dropdown}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelect(item)}>
                                <List.Item
                                    title={`${item.name} (${item.iata})`}
                                    description={`${item.city ? item.city + ', ' : ''}${item.country_code}`}
                                    left={() => item.subType === 'CITY' ? <List.Icon icon="city" /> : <List.Icon icon="airplane" />}
                                    titleNumberOfLines={0}
                                    titleStyle={{
                                        fontWeight: item.subType === 'CITY' ? 'bold' : 'normal',
                                        paddingLeft: item.groupData ? 8 : 32,
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignSelf: 'center',
        // borderWidth: 1,
        // borderColor: 'red',
        marginBottom: 0,
    },
    dropdown: {
        maxHeight: 200,
        // position: 'absolute',
        // top: 100,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.translucent,
        elevation: 2,
        borderRadius: 4,
        // borderWidth: 1,
        // borderColor: theme.colors.primaryGlass
    },
});

export default AutocompleteInput;
