import React, { useState, useEffect } from "react";
import { Button } from "antd";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  Paper,
} from "@mui/material";
import api from "../../../config/axios";
import AddRecommendations from "./AddRecommendations";
import ViewRecommendByCategory from "./ViewRecommendByCategory";

const ManageRecommendations = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [waterParameters, setWaterParameters] = useState([]);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const showPopup = () => {
    setOpen(true);
  };

  const hidePopup = () => {
    setOpen(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recommendationsRes, categoriesRes, waterParametersRes] =
        await Promise.all([
          api.get("/api/productRecommends/getAllProductRecommends"),
          api.get("/api/categories/getAllCategories"),
          api.get("/api/waterPara/getAllWaterParameter"),
        ]);

      setRecommendations(recommendationsRes.data);
      setCategories(categoriesRes.data);
      setWaterParameters(waterParametersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.categoryName : "Unknown Category";
  };

  const getPondName = (waterParameterId) => {
    const parameter = waterParameters.find(
      (param) => param.waterParameterId === waterParameterId
    );
    return parameter ? parameter.Pond.pondName : "Unknown Pond";
  };

  const openCategoryModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCategoryModalOpen(true);
  };

  const tableStyles = {
    container: {
      width: "100%",
      margin: "20px auto",
      borderRadius: "8px",
      overflow: "hidden",
    },
    bodyRow: {},
    bodyCell: {},
  };

  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: 16,
          backgroundColor: "rgb(180,0,0)",
          borderColor: "rgb(180,0,0)",
        }}
        onClick={showPopup}
      >
        Create New Recommendation
      </Button>
      <AddRecommendations
        isOpen={open}
        onClose={hidePopup}
        categories={categories}
        waterParameters={waterParameters}
        onAddSuccess={fetchData}
      />

      {loading ? (
        <div>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} style={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ width: "10%", color: "rgb(180,0,0)" }}
                  align="center"
                >
                  ID
                </TableCell>
                <TableCell style={{ color: "rgb(180,0,0)" }} align="center">
                  CATEGORY
                </TableCell>
                <TableCell style={{ color: "rgb(180,0,0)" }} align="center">
                  POND
                </TableCell>
                <TableCell style={{ color: "rgb(180,0,0)" }} align="center">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={rec.id} style={tableStyles.bodyRow} hover>
                  <TableCell align="center" style={{ width: "15%" }}>
                    {rec.recommendId}
                  </TableCell>
                  <TableCell align="center" style={{ width: "20%" }}>
                    {getCategoryName(rec.categoryId)}
                  </TableCell>
                  <TableCell align="center" style={{ width: "20%" }}>
                    {getPondName(rec.waterParameterId)}
                  </TableCell>
                  <TableCell align="center" style={{ width: "20%" }}>
                    <Button
                      style={{ color: "rgb(180,0,0)" }}
                      onClick={() => openCategoryModal(rec.categoryId)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ViewRecommendByCategory
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryId={selectedCategoryId}
      />
    </div>
  );
};

export default ManageRecommendations;
