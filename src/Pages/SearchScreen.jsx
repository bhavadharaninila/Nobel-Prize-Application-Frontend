import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  TextField,
  Autocomplete,
  Button,
  FormControlLabel,
} from "@mui/material";
import "./styles.scss";
import SerachList from "./SearchList";
import image from "../utils/headerImg.jpg"

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const basicSimilarity = (termLower, strLower) => {
  let accuracy = 0;

  for (let i = 1; i <= termLower.length; i++) {
    if (strLower?.includes(termLower.slice(0, i))) {
      accuracy++;
    }
  }

  return accuracy;
};
const isMatch = (term, str) => {
  const termLower = term?.toLowerCase();
  const strLower = str?.toLowerCase();
  return strLower?.includes(termLower);
};

const CustomAutocomplete = () => {
  const [value, setValue] = useState("");
  const [nameOptionList, setNameOptionList] = useState([]);
  const [categoryOptionList, setcategoryOptionList] = useState([]);
  const [yearOptionList, setYearOptionList] = useState([]);
  const [data, setData] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [topMatch, setTopMatch] = useState("");
  const [selectedOption, setSelectedOption] = useState({
    category: "",
    year: "",
  });
  let filteredOptionList = [];
  const filterOptions = (options, { inputValue }) => {
    filteredOptionList = options.filter((option) =>
      isMatch(inputValue, option)
    );
    return filteredOptionList;
  };
  const filterFunction = (array, filterVal) => {
    let arr = [];
    arr = array?.filter((option) => {
      const { category, year } = option;
      return isMatch(
        filterVal == "category" ? selectedOption.category : selectedOption.year,
        filterVal == "category" ? category : year
      );
    });
    return arr;
  };

  const getListItem = () => {
    const lowerValue = value?.toLowerCase();
    setActiveSearch(true)
    let resultList = [],
    isLaureateMatch,
    finalArray;

    let isMismatchArray = nameOptionList.filter((option) =>
      isMatch(lowerValue, option)
    );

    if (isMismatchArray?.length > 0 && lowerValue !== "") {
      data?.forEach((option) => {
        const { category, laureates, year } = option;
        isLaureateMatch = laureates?.filter((laureate) => {
          const fullName = `${laureate.firstname} ${laureate.surname}`;
          if (isMatch(lowerValue, fullName)) {
            laureate["year"] = year;
            laureate["category"] = category;
            resultList.push(laureate);
          }
        });
      });
    } else {
      const accurateOption = nameOptionList.map((option) => ({
        option,
        match: basicSimilarity(lowerValue, option),
      }));
      const topMatch = accurateOption.reduce((max, item) =>
        item.match > max.match ? item : max
      );
      setTopMatch(topMatch?.option);
      data?.forEach((option) => {
        const { category, laureates, year } = option;
        isLaureateMatch = laureates?.filter((laureate) => {
          const fullName = `${laureate.firstname} ${laureate.surname}`;
          if (isMatch(topMatch?.option, fullName)) {
            laureate["year"] = year;
            laureate["category"] = category;
            resultList.push(laureate);
          }
        });
      });
    }
    resultList.concat(isLaureateMatch);
    if (lowerValue.length > 0) {
      if (selectedOption.category !== "" && selectedOption.year !== "") {
        let catArray = filterFunction(resultList, "category");
        let yearArray = filterFunction(resultList, "year");
        let arr = [...catArray, ...yearArray];
        finalArray = arr.filter(
          (item) =>
            item.category === selectedOption.category &&
            item.year === selectedOption.year
        );
      } else if (selectedOption.category !== "" && selectedOption.year === "") {
        finalArray = filterFunction(resultList, "category");
      } else if (selectedOption.year !== "" && selectedOption.category === "") {
        finalArray = filterFunction(resultList, "year");
      } else if (selectedOption.category === "" && selectedOption.year === "") {
        finalArray = resultList;
      }
    }
    
    if (lowerValue.length === 0) {
      if (selectedOption.category !== "" && selectedOption.year !== "") {
        let catArray = filterFunction(data, "category");
        let yearArray = filterFunction(data, "year");
        let arr = [...catArray, ...yearArray];
        finalArray = arr.filter(
          (item) =>
            item.category === selectedOption.category &&
            item.year === selectedOption.year
        );
      } else if (
        selectedOption.category !== "" &&
        selectedOption.year === ""
      ) {
        finalArray = filterFunction(data, "category");
      } else if (selectedOption.year !== "" && selectedOption.category === "") {
        finalArray = filterFunction(data, "year");
      }
    }
    setDisplayList([...new Set(finalArray)]);
  };
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/data')
      .then((response) => {
        const flattenOptions = [];
        const categoryOptions = [];
        const yearOptions = [];
        let filteredData = response.data.prizes.filter((obj) => obj.laureates);
        filteredData.forEach((option) => {
          categoryOptions.push(option.category);
          yearOptions.push(option.year);
          option.laureates.forEach((laureate) => {
            flattenOptions.push(
              `${laureate.firstname} ${
                laureate.surname ? laureate.surname : ""
              }`
            );
          });
        });
        setNameOptionList([...new Set(flattenOptions)]);
        setcategoryOptionList([...new Set(categoryOptions)]);
        setYearOptionList([...new Set(yearOptions)]);
        setData(filteredData);
      })
      .catch((error) => {
        console.log("ERROR :", error);
        setData([]);
      });
  }, []);
  const debouncedSearch = useCallback(
    debounce(() => getListItem(), 200),
    [getListItem]
  );
  return (
    <>
      <div className="container">
      <div className="header">
  <img src={image} alt="Noble Prize Background" />
  <div className="text-overlay">Noble Prize</div>
</div>
        {/* <h1 className="header">Noble Prize</h1> */}
        <div className="search-row">
          <Autocomplete
            fullWidth
            freeSolo
            options={nameOptionList}
            inputValue={value}
            className="text-field"
            filterOptions={filterOptions}
            getOptionLabel={(option) => {
              return `${option}`;
            }}
            // open = {value?.length > 0}
            onInputChange={(event, newInputValue) => {
              setValue(newInputValue || "");
              debouncedSearch();
            }}
            onChange={debouncedSearch}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder="Search Laureate" />
            )}
          />

          <Autocomplete
            id="category"
            options={categoryOptionList}
            onChange={(event, newValue) => {
              setSelectedOption((prevState) => ({
                ...prevState,
                category: newValue || "",
              }));
              debouncedSearch();
            }}
            className="select-field category"
            renderInput={(params) => (
              <TextField {...params} placeholder="Category" />
            )}
          />

          <Autocomplete
            id="year"
            options={yearOptionList}
            onChange={(value, newValue) => {
              setSelectedOption((prevState) => ({
                ...prevState,
                year: newValue || "",
              }));
              debouncedSearch();
            }}
            className="select-field"
            renderInput={(params) => (
              <TextField {...params} placeholder="Year" />
            )}
          />
          <Button
            variant="contained"
            onClick={() => getListItem()}
            className="search-button"
          >
            Search
          </Button>
        </div>
        {displayList.length === 0 ? activeSearch ? <h4>No Results Found!</h4>: <h4>Enter Fields!</h4> : null }
        <SerachList displayList={displayList} setDisplayList = {setDisplayList}activeSearch = {activeSearch}/>
      </div>
    </>
  );
};

export default CustomAutocomplete;
