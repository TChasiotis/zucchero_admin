import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

export default function BannersTab() {
  return (
    <View
      style={tw`flex-1 bg-white border border-slate-200 rounded-3xl p-8 items-center justify-center`}
    >
      <View style={tw`bg-indigo-50 p-6 rounded-full mb-6`}>
        <Feather name="image" size={48} color="#4f46e5" />
      </View>
      <Text style={tw`text-2xl font-black text-slate-800 mb-2`}>
        Μπάνερ Διαφημίσεων
      </Text>
      <Text style={tw`text-slate-500 text-center mb-8 px-4`}>
        Εδώ θα προσθέσουμε τη λογική για να ανεβάζεις τις φωτογραφίες που θα
        παίζουν στην αρχική οθόνη του ψηφιακού καταλόγου.
      </Text>

      <TouchableOpacity
        style={tw`bg-indigo-600 flex-row items-center gap-2 px-6 py-4 rounded-xl active:bg-indigo-700`}
      >
        <Feather name="upload" size={20} color="white" />
        <Text style={tw`text-white font-bold text-lg`}>
          Ανέβασμα Νέου Μπάνερ
        </Text>
      </TouchableOpacity>
    </View>
  );
}
