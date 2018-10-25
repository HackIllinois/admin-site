import { connect } from "react-redux";
import School from "./index";
import { addSchool } from "../../services/school/actions";

const getSchools = (schools) => {
  return schools.school;
}



const mapStateToProps = state => ({
  schools: getSchools(state)
});

const mapDispatchToProps = dispatch => ({
  add: (name, numStudents) => dispatch(addSchool(name, numStudents))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(School);
