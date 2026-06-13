import { Feather } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  tempName: string;
  setTempName: (val: string) => void;
  tempDesc: string;
  setTempDesc: (val: string) => void;
  tempPrice: string;
  setTempPrice: (val: string) => void;
  tempUnit: string | null; // ΝΕΟ
  setTempUnit: (val: string | null) => void; // ΝΕΟ
  tempSoldOut: boolean;
  setTempSoldOut: (val: boolean) => void;
  tempPopular: boolean;
  handleTogglePopular: (val: boolean) => void;
  tempVegan: boolean;
  setTempVegan: (val: boolean) => void;
  tempGlutenFree: boolean;
  setTempGlutenFree: (val: boolean) => void;
  tempEgg: boolean;
  setTempEgg: (val: boolean) => void;
  tempDairy: boolean;
  setTempDairy: (val: boolean) => void;
  tempNuts: boolean;
  setTempNuts: (val: boolean) => void;
  tempSoy: boolean;
  setTempSoy: (val: boolean) => void;
  saveLocalChanges: () => void;
  onDeleteCustom?: () => void;
}

export default function EditProductModal({
  visible,
  editingItem,
  onClose,
  tempName,
  setTempName,
  tempDesc,
  setTempDesc,
  tempPrice,
  setTempPrice,
  tempUnit,
  setTempUnit,
  tempSoldOut,
  setTempSoldOut,
  tempPopular,
  handleTogglePopular,
  tempVegan,
  setTempVegan,
  tempGlutenFree,
  setTempGlutenFree,
  tempEgg,
  setTempEgg,
  tempDairy,
  setTempDairy,
  tempNuts,
  setTempNuts,
  tempSoy,
  setTempSoy,
  saveLocalChanges,
  onDeleteCustom,
}: Props) {
  const isCustom =
    editingItem?.id?.startsWith("custom_") || editingItem?.isNewProduct;
  const isHidePrice = editingItem?.hidePrice === true;
  const isInfoBlock =
    isHidePrice && editingItem?.id?.toLowerCase().includes("info");
  const isExtraBlock = isHidePrice && !isInfoBlock;

  const AllergenToggle = ({
    label,
    value,
    onValueChange,
    icon,
    color,
  }: any) => (
    <View
      style={tw`flex-row items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full mb-3`}
    >
      <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
        <View style={tw`bg-white p-2 rounded-full shadow-sm`}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <Text
          style={tw`text-base font-bold text-slate-700 flex-1`}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e2e8f0", true: color }}
        thumbColor={value ? "#ffffff" : "#f8fafc"}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 bg-black/70 p-4 justify-center items-center`}>
          <View
            style={tw`flex-1 bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl mt-8 mb-4`}
          >
            {/* HEADER */}
            <View
              style={tw`flex-row items-center justify-between p-5 border-b border-slate-100 bg-white`}
            >
              <View style={tw`flex-row items-center gap-4 flex-1`}>
                <View style={tw`bg-indigo-50 p-3 rounded-2xl`}>
                  <Feather
                    name={
                      isInfoBlock
                        ? "info"
                        : isExtraBlock
                          ? "plus-circle"
                          : "edit"
                    }
                    size={24}
                    color="#4f46e5"
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={tw`text-xs font-bold text-slate-400 uppercase tracking-wide`}
                  >
                    {isInfoBlock
                      ? "Μπλοκ Πληροφοριας"
                      : isExtraBlock
                        ? "Εξτρα Επιλογη"
                        : isCustom
                          ? "Νεο Προιον"
                          : "Βασικο Προιον"}
                  </Text>
                  <Text
                    style={tw`text-xl font-black text-slate-800`}
                    numberOfLines={1}
                  >
                    {editingItem?.translations?.el?.name || "Χωρίς Τίτλο"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={tw`p-3 bg-slate-100 rounded-full active:bg-slate-200 ml-2`}
              >
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`p-6`}
            >
              {(isCustom || isExtraBlock) && (
                <View style={tw`mb-6`}>
                  <Text
                    style={tw`text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide`}
                  >
                    Όνομα (Ελληνικά)
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg font-bold text-slate-800`}
                    value={tempName}
                    onChangeText={setTempName}
                  />
                </View>
              )}

              {(isCustom || isInfoBlock) && (
                <View style={tw`mb-6`}>
                  <Text
                    style={tw`text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide`}
                  >
                    Περιγραφή
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base text-slate-800 min-h-[100px]`}
                    multiline
                    textAlignVertical="top"
                    value={tempDesc}
                    onChangeText={setTempDesc}
                  />
                </View>
              )}

              {!isHidePrice && (
                <View style={tw`mb-6`}>
                  <Text
                    style={tw`text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide`}
                  >
                    Τιμη (€)
                  </Text>
                  <View
                    style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4`}
                  >
                    <TextInput
                      style={tw`flex-1 text-3xl font-black text-slate-800`}
                      keyboardType="decimal-pad"
                      value={tempPrice}
                      onChangeText={setTempPrice}
                    />
                    <Feather name="edit-3" size={24} color="#cbd5e1" />
                  </View>
                </View>
              )}

              {/* --- ΝΕΟ: ΕΠΙΛΟΓΗ ΜΟΝΑΔΑΣ ΜΕΤΡΗΣΗΣ (ΜΟΝΟ ΓΙΑ CUSTOM) --- */}
              {isCustom && !isHidePrice && (
                <View style={tw`mb-6`}>
                  <Text
                    style={tw`text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide`}
                  >
                    Μονάδα Μέτρησης
                  </Text>
                  <View style={tw`flex-row gap-2`}>
                    <TouchableOpacity
                      onPress={() => setTempUnit(null)}
                      style={tw`flex-1 py-3 rounded-xl border-2 items-center ${tempUnit === null ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
                    >
                      <Text
                        style={tw`font-bold ${tempUnit === null ? "text-indigo-700" : "text-slate-600"}`}
                      >
                        Κομμάτι
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTempUnit("kg")}
                      style={tw`flex-1 py-3 rounded-xl border-2 items-center ${tempUnit === "kg" ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
                    >
                      <Text
                        style={tw`font-bold ${tempUnit === "kg" ? "text-indigo-700" : "text-slate-600"}`}
                      >
                        Κιλό
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTempUnit("portion")}
                      style={tw`flex-1 py-3 rounded-xl border-2 items-center ${tempUnit === "portion" ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
                    >
                      <Text
                        style={tw`font-bold ${tempUnit === "portion" ? "text-indigo-700" : "text-slate-600"}`}
                      >
                        Μερίδα
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STATUS TOGGLES */}
              <View style={tw`mb-8`}>
                <View
                  style={tw`flex-row items-center justify-between bg-red-50 p-4 rounded-2xl border border-red-100 mb-3`}
                >
                  <View style={tw`flex-1 mr-4`}>
                    <Text style={tw`text-lg font-black text-red-900`}>
                      Εξαντληθηκε
                    </Text>
                    <Text style={tw`text-xs font-bold text-red-500`}>
                      Κρύβει το στοιχείο από τον κατάλογο
                    </Text>
                  </View>
                  <Switch
                    value={tempSoldOut}
                    onValueChange={setTempSoldOut}
                    trackColor={{ false: "#e2e8f0", true: "#fca5a5" }}
                    thumbColor={tempSoldOut ? "#ef4444" : "#f8fafc"}
                  />
                </View>

                {!isHidePrice && (
                  <View
                    style={tw`flex-row items-center justify-between bg-yellow-50 p-4 rounded-2xl border border-yellow-100`}
                  >
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={tw`text-lg font-black text-yellow-900`}>
                        Top 10 (Δημοφιλές)
                      </Text>
                    </View>
                    <Switch
                      value={tempPopular}
                      onValueChange={handleTogglePopular}
                      trackColor={{ false: "#e2e8f0", true: "#fde047" }}
                      thumbColor={tempPopular ? "#eab308" : "#f8fafc"}
                    />
                  </View>
                )}
              </View>

              {!isHidePrice && (
                <>
                  <View style={tw`h-px bg-slate-100 w-full mb-6`} />
                  <Text style={tw`text-xl font-black text-slate-800 mb-5`}>
                    Αλλεργιογόνα & Διαιτολόγιο
                  </Text>
                  <View style={tw`flex-col`}>
                    <AllergenToggle
                      label="Vegan"
                      value={tempVegan}
                      onValueChange={setTempVegan}
                      icon="leaf"
                      color="#22c55e"
                    />
                    <AllergenToggle
                      label="Χωρίς Γλουτένη"
                      value={tempGlutenFree}
                      onValueChange={setTempGlutenFree}
                      icon="wind"
                      color="#f59e0b"
                    />
                    <AllergenToggle
                      label="Περιέχει Αυγό"
                      value={tempEgg}
                      onValueChange={setTempEgg}
                      icon="circle"
                      color="#fbbf24"
                    />
                    <AllergenToggle
                      label="Περιέχει Γαλακτοκομικά"
                      value={tempDairy}
                      onValueChange={setTempDairy}
                      icon="droplet"
                      color="#3b82f6"
                    />
                    <AllergenToggle
                      label="Περιέχει Ξηρούς Καρπούς"
                      value={tempNuts}
                      onValueChange={setTempNuts}
                      icon="octagon"
                      color="#a8a29e"
                    />
                    <AllergenToggle
                      label="Περιέχει Σόγια"
                      value={tempSoy}
                      onValueChange={setTempSoy}
                      icon="hexagon"
                      color="#84cc16"
                    />
                  </View>
                </>
              )}

              {/* ΚΟΥΜΠΙ ΔΙΑΓΡΑΦΗΣ - ΛΕΙΤΟΥΡΓΕΙ ΚΑΝΟΝΙΚΑ ΤΩΡΑ */}
              {isCustom && (
                <TouchableOpacity
                  onPress={onDeleteCustom}
                  style={tw`mt-8 bg-red-100 p-4 rounded-xl flex-row items-center justify-center gap-2 border border-red-200 active:bg-red-200`}
                >
                  <Feather name="trash-2" size={20} color="#dc2626" />
                  <Text style={tw`text-red-600 font-bold text-lg`}>
                    Οριστική Διαγραφή Προϊόντος
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* FOOTER */}
            <View
              style={tw`p-5 border-t border-slate-100 bg-white flex-row gap-3`}
            >
              <TouchableOpacity
                onPress={saveLocalChanges}
                style={tw`bg-slate-900 py-4 rounded-2xl items-center flex-row justify-center flex-1 active:bg-slate-800 shadow-sm`}
              >
                <Text
                  style={tw`text-white font-black text-center text-sm tracking-wide`}
                >
                  Αποθήκευση αλλαγών
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
