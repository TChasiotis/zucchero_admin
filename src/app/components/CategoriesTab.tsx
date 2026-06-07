import { Feather } from "@expo/vector-icons";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

interface Props {
  sortedCategories: any[];
  moveCategory: (id: string, direction: "up" | "down") => void;
  toggleCategoryVisibility: (id: string, status: boolean) => void;
}

export default function CategoriesTab({
  sortedCategories,
  moveCategory,
  toggleCategoryVisibility,
}: Props) {
  return (
    <View
      style={tw`flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden`}
    >
      <View style={tw`p-5 border-b border-slate-100 bg-slate-50`}>
        <Text style={tw`text-lg font-bold text-slate-800`}>
          Διαχείριση Κατηγοριών
        </Text>
        <Text style={tw`text-slate-500 text-sm`}>
          Αλλάξτε τη σειρά (Πάνω/Κάτω) ή κρύψτε μια ολόκληρη κατηγορία.
        </Text>
      </View>
      <FlatList
        data={sortedCategories}
        keyExtractor={(cat) => cat.id}
        renderItem={({ item: cat, index }) => (
          <View
            style={tw`flex-row items-center justify-between p-5 border-b border-slate-100`}
          >
            <Text
              style={tw`text-lg font-bold text-slate-800 ${cat.isNotAvailable ? "line-through text-slate-400" : ""}`}
            >
              {cat.translations?.el || "Άγνωστη"}
            </Text>
            <View style={tw`flex-row items-center gap-2`}>
              <TouchableOpacity
                onPress={() => moveCategory(cat.id, "up")}
                disabled={index === 0}
                style={tw`p-2 bg-slate-100 rounded-lg active:bg-slate-200 ${index === 0 ? "opacity-30" : ""}`}
              >
                <Feather name="arrow-up" size={18} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveCategory(cat.id, "down")}
                disabled={index === sortedCategories.length - 1}
                style={tw`p-2 bg-slate-100 rounded-lg active:bg-slate-200 ${index === sortedCategories.length - 1 ? "opacity-30" : ""}`}
              >
                <Feather name="arrow-down" size={18} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  toggleCategoryVisibility(cat.id, cat.isNotAvailable)
                }
                style={tw`p-3 bg-slate-100 rounded-lg active:bg-slate-200`}
              >
                <Feather
                  name={cat.isNotAvailable ? "eye-off" : "eye"}
                  size={18}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
