import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

interface Props {
  visible: boolean;
  editingItem: any;
  onClose: () => void;
  tempPrice: string;
  setTempPrice: (val: string) => void;
  tempSoldOut: boolean;
  setTempSoldOut: (val: boolean) => void;
  tempPopular: boolean;
  handleTogglePopular: (val: boolean) => void;
  saveLocalChanges: () => void;
}

export default function EditProductModal({
  visible,
  editingItem,
  onClose,
  tempPrice,
  setTempPrice,
  tempSoldOut,
  setTempSoldOut,
  tempPopular,
  handleTogglePopular,
  saveLocalChanges,
}: Props) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={tw`flex-1 bg-black/50 justify-center items-center`}>
        <View style={tw`bg-white w-11/12 max-w-md rounded-3xl p-6 shadow-2xl`}>
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <Text
              style={tw`text-xl font-black text-slate-800 flex-1`}
              numberOfLines={1}
            >
              {editingItem?.translations?.el?.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={tw`p-2`}>
              <Feather name="x" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-bold text-slate-500 mb-2 uppercase`}>
              Τιμη (€)
            </Text>
            <View
              style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3`}
            >
              <TextInput
                style={tw`flex-1 text-2xl font-black text-slate-800`}
                keyboardType="decimal-pad"
                value={tempPrice}
                onChangeText={setTempPrice}
              />
              <Feather name="edit-3" size={20} color="#cbd5e1" />
            </View>
          </View>

          <View
            style={tw`flex-row items-center justify-between py-4 border-t border-slate-100`}
          >
            <View>
              <Text style={tw`text-lg font-bold text-slate-800`}>
                Εξαντλήθηκε
              </Text>
              <Text style={tw`text-sm text-slate-500`}>
                Θα κρύψει το προϊόν από τους πελάτες
              </Text>
            </View>
            <Switch
              value={tempSoldOut}
              onValueChange={setTempSoldOut}
              trackColor={{ false: "#e2e8f0", true: "#fca5a5" }}
              thumbColor={tempSoldOut ? "#ef4444" : "#f8fafc"}
            />
          </View>

          <View
            style={tw`flex-row items-center justify-between py-4 border-t border-slate-100`}
          >
            <View>
              <Text style={tw`text-lg font-bold text-slate-800`}>
                Δημοφιλές (Top 10)
              </Text>
              <Text style={tw`text-sm text-slate-500`}>
                Προσθήκη στην αρχική κατηγορία
              </Text>
            </View>
            <Switch
              value={tempPopular}
              onValueChange={handleTogglePopular}
              trackColor={{ false: "#e2e8f0", true: "#fde047" }}
              thumbColor={tempPopular ? "#eab308" : "#f8fafc"}
            />
          </View>

          <TouchableOpacity
            onPress={saveLocalChanges}
            style={tw`bg-slate-900 py-4 rounded-xl items-center mt-4 active:bg-slate-800`}
          >
            <Text style={tw`text-white text-lg font-bold`}>
              Αποθήκευση Τοπικά
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
