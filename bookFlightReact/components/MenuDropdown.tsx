import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Menu, TextInput } from "react-native-paper";

type MenuDropdownProps = {
  items: string[];
  selectedItem: string;
  label: string;
  type: string;
  handleChange: (type: string) => (value: string) => void;
  styles?: any;
  icon?: string;
};

export default function MenuDropdown({
  items,
  selectedItem,
  label,
  type,
  handleChange,
  styles = {},
  icon,
}: MenuDropdownProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        style={[simpleStyles.menu, styles.menu]}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <View pointerEvents="none">
              <TextInput
                label={selectedItem ? "" : label}
                value={selectedItem || ""}
                mode="flat"
                style={[simpleStyles.textInput, styles.textInput]}
                left={icon ? <TextInput.Icon icon={icon} size={18} color="#222" /> : null}
                right={<TextInput.Icon icon="chevron-down" size={18} color="#222" />}
                dense
                underlineColor="transparent"
                editable={false}
                selectTextOnFocus={false}
                pointerEvents="none"
                theme={{
                  colors: {
                    background: "#fff",
                    primary: "#222",
                    text: "#222",
                    placeholder: "#999",
                  },
                }}
              />
            </View>
          </TouchableOpacity>
        }
      >
        {items.map((item, index) => (
          <Menu.Item
            key={item}
            onPress={() => {
              handleChange(type)(item);
              closeMenu();
            }}
            title={item}
            style={simpleStyles.menuItem}
            titleStyle={{ fontSize: 14, color: "#222" }}
          />
        ))}
      </Menu>
    </View>
  );
}

const simpleStyles = StyleSheet.create({
  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 120,
    paddingVertical: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    // marginTop: 5,
  },
  textInput: {
    height: 30,
    fontSize: 14,
    backgroundColor: "#fff",
    borderColor: "#e2e2e2",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginVertical: 2,
    // marginHorizontal: ,
    color: "#222",
  },
  menuItem: {
    minHeight: 32,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
