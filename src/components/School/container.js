import { connect } from "react-redux";
import School from "./School";
import { VisibilityFilters } from ".../services/school/actions";

const getSchools = (schools) => {
  return [{
    school: 'University of Illinois Urbana-Champaign',
    numStudents: 500,
    dogsColor: 'hsl(89, 70%, 50%)',
  }];
  }
};


const mapStateToProps = state => ({
  schools: getSchools(state.schoolReducer)
});

export default connect(
  mapStateToProps
)(School);
