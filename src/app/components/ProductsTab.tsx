import { Feather } from "@expo/vector-icons";
import { useState } from "react";
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
  moveItemUp?: (id: string) => void;
  moveItemDown?: (id: string) => void;
  moveItemToTop?: (id: string) => void;
  moveItemToBottom?: (id: string) => void;
}

export default function ProductsTab({
  sortedCategories,
  activeItems,
  selectedFoodCategory,
  setSelectedFoodCategory,
  openEditModal,
  moveItemUp,
  moveItemDown,
  moveItemToTop,
  moveItemToBottom,
}: Props) {
  const [isSortMode, setIsSortMode] = useState(false);

  // Το Φίλτρο: Δείχνουμε τα δικά σου Separators ΜΟΝΟ αν είμαστε σε Sort Mode
  const displayItems = activeItems.filter((item) => {
    if (item.isSeparator && !isSortMode) return false;
    return true;
  });

  return (
    <View style={tw`flex-1`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-1 mr-4`}>
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

        <TouchableOpacity
          onPress={() => setIsSortMode(!isSortMode)}
          style={tw`flex-row items-center gap-2 px-4 py-2 rounded-full border ${isSortMode ? "bg-emerald-100 border-emerald-200" : "bg-indigo-50 border-indigo-100"}`}
        >
          <Feather
            name={isSortMode ? "check" : "move"}
            size={18}
            color={isSortMode ? "#059669" : "#4f46e5"}
          />
          <Text
            style={tw`font-black ${isSortMode ? "text-emerald-700" : "text-indigo-700"}`}
          >
            {isSortMode ? "Τέλος Ταξινόμησης" : "Ταξινόμηση"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={tw`flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden`}
      >
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={tw`flex-row items-center justify-between p-5 border-b border-slate-100 ${item.isSoldOut ? "bg-red-50 opacity-70" : "bg-white"}`}
            >
              <View style={tw`flex-1 mr-4`}>
                <View style={tw`flex-row items-center gap-2`}>
                  {item.id?.startsWith("custom_") && (
                    <Feather name="cpu" size={14} color="#8b5cf6" />
                  )}
                  {item.hidePrice &&
                    !item.isSeparator &&
                    item.id?.toLowerCase().includes("info") && (
                      <Feather name="info" size={14} color="#3b82f6" />
                    )}
                  {item.hidePrice &&
                    !item.isSeparator &&
                    !item.id?.toLowerCase().includes("info") && (
                      <Feather name="plus-circle" size={14} color="#f59e0b" />
                    )}

                  {/* Αφήνουμε το όνομα να φανεί ακριβώς όπως το έχεις στήσει στη βάση σου */}
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
                {!item.isSeparator && (
                  <Text
                    style={tw`text-slate-500 text-sm mt-1`}
                    numberOfLines={1}
                  >
                    {item.translations?.el?.description || ""}
                  </Text>
                )}
              </View>

              <View style={tw`flex-row items-center gap-4`}>
                {!isSortMode && !item.isSeparator && (
                  <Text
                    style={tw`text-xl font-black ${item.hidePrice ? "text-slate-400 line-through" : "text-[#97dcf5]"}`}
                  >
                    {item.price}€
                  </Text>
                )}

                {!isSortMode ? (
                  /* ΔΕΝ δείχνουμε κουμπί Edit στα separators */
                  !item.isSeparator && (
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={tw`p-3 bg-slate-100 rounded-lg active:bg-slate-200`}
                    >
                      <Feather name="edit-2" size={18} color="#475569" />
                    </TouchableOpacity>
                  )
                ) : (
                  <View
                    style={tw`flex-row items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200`}
                  >
                    <TouchableOpacity
                      onPress={() => moveItemToTop && moveItemToTop(item.id)}
                      style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-slate-100`}
                    >
                      <Feather name="chevrons-up" size={20} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItemUp && moveItemUp(item.id)}
                      style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-indigo-50`}
                    >
                      <Feather name="arrow-up" size={20} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItemDown && moveItemDown(item.id)}
                      style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-indigo-50`}
                    >
                      <Feather name="arrow-down" size={20} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        moveItemToBottom && moveItemToBottom(item.id)
                      }
                      style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-slate-100`}
                    >
                      <Feather name="chevrons-down" size={20} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
