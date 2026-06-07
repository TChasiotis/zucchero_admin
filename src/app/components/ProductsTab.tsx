import { Feather } from "@expo/vector-icons";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

interface Props {
  sortedCategories: any[];
  activeItems: any[];
  selectedFoodCategory: string | null;
  setSelectedFoodCategory: (id: string) => void;
  openEditModal: (item: any) => void;
}

export default function ProductsTab({
  sortedCategories,
  activeItems,
  selectedFoodCategory,
  setSelectedFoodCategory,
  openEditModal,
}: Props) {
  return (
    <View style={tw`flex-1`}>
      <View style={tw`mb-4`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`gap-2`}
        >
          {sortedCategories.map((cat) => {
            const isSelected = selectedFoodCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedFoodCategory(cat.id)}
                style={tw`px-4 py-2 rounded-full border ${isSelected ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"}`}
              >
                <Text
                  style={tw`font-bold ${isSelected ? "text-white" : "text-slate-600"}`}
                >
                  {cat.translations?.el || "Άγνωστη"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={tw`flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden`}
      >
        <FlatList
          data={activeItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={tw`flex-row items-center justify-between p-5 border-b border-slate-100 ${item.isSoldOut ? "bg-red-50 opacity-70" : "bg-white"}`}
            >
              <View style={tw`flex-1 mr-4`}>
                <View style={tw`flex-row items-center gap-2`}>
                  <Text style={tw`text-lg font-bold text-slate-800`}>
                    {item.translations?.el?.name || "Χωρίς Όνομα"}
                  </Text>
                  {item.isSoldOut && (
                    <View style={tw`bg-red-500 px-2 py-1 rounded`}>
                      <Text style={tw`text-white text-xs font-bold uppercase`}>
                        Εξαντληθηκε
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={tw`text-slate-500 text-sm mt-1`} numberOfLines={1}>
                  {item.translations?.el?.description || ""}
                </Text>
              </View>
              <View style={tw`flex-row items-center gap-4`}>
                <Text
                  style={tw`text-xl font-black ${item.hidePrice ? "text-slate-400 line-through" : "text-[#97dcf5]"}`}
                >
                  {item.price}€
                </Text>
                <TouchableOpacity
                  onPress={() => openEditModal(item)}
                  style={tw`p-3 bg-slate-100 rounded-lg active:bg-slate-200`}
                >
                  <Feather name="edit-2" size={18} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
