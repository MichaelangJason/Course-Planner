
import { TermId } from "@/types/term";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { memo, useCallback } from "react";
import { DraggingType } from "@/utils/enums";
import { setAddingCourseId, setSeekingInfo } from "@/store/slices/globalSlice";
import { toast } from "react-toastify";
import { CourseCard } from "@/components/Course";
import { getCourse } from "@/utils/requests";
import { addCourseToTerm, deleteTerm } from "@/store/slices/termSlice";
import { addCourse, setCourseMounted } from "@/store/slices/courseSlice";
import "@/styles/terms.scss"
import Image from "next/image";
import { IRawCourse } from "@/db/schema";

export interface TermCardProps {
  termId: TermId;
  index: number;
}

const TermCard = (props: TermCardProps) => {
  const { termId, index } = props;
  const termData = useSelector((state: RootState) => state.terms.data[termId]);
  const courseIds = termData.courseIds || [];
  const termName = termData.name || `Term ${index + 1}`;
  const { seekingId, seekingTerm } = useSelector((state: RootState) => state.global.seekingInfo);
  const isSeeking = seekingId !== undefined && seekingTerm !== undefined;
  const isSeekingSelf = isSeeking && seekingTerm === termId;
  const credits = useSelector((state: RootState) => 
    courseIds.reduce((acc, courseId) => {
      if (!(courseId in state.courses)) {
        return acc;
      }
      const credits = state.courses[courseId].credits;
      return acc + (credits < 0 ? 0 : credits);
    }, 0)
  )

  const dispatch = useDispatch();
  const addingCourseId = useSelector((state: RootState) => state.global.addingCourseId);
  const isAddingCourse = addingCourseId !== null;
  const inTermCourseIds = useSelector((state: RootState) => state.terms.inTermCourseIds);
  const existingAddingCourse = useSelector((state: RootState) => addingCourseId ? state.courses[addingCourseId] : null)

  const handleAddCourse = useCallback(async () => {
    // check if course exists in any term
    if (inTermCourseIds.includes(addingCourseId!)) {

      toast.error(`Cannot add duplicate ${addingCourseId}`);
      dispatch(setAddingCourseId(null));
      return;
    }
    
    dispatch(setAddingCourseId(null));

    // for animation purposes, delay adding course
    setTimeout(async () => {
      let course: IRawCourse | null = existingAddingCourse;

      if (!course) {
        course = await toast.promise(
          getCourse(addingCourseId!),
          {
            pending: `Fetching ${addingCourseId}...`,
            error: `Failed to fetch ${addingCourseId}`,
            success: `${addingCourseId} fetched successfully`,
          }
        );
      }
      
      if (!course) {
        toast.error("Course not found");
      } else {
          const id = course.id;
          dispatch(addCourse(course))
          dispatch(addCourseToTerm({ termId, courseId: id }))
          toast.success(`${id} added to term ${index + 1}`);

          setTimeout(() => { // set mounted after animation
            dispatch(setCourseMounted({ courseId: id, isMounted: true }))
          }, 200);
        }
      }, 100);

  }, [index, termId, addingCourseId, dispatch, inTermCourseIds, existingAddingCourse]);

  const handleDeleteTerm = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSeekingSelf) dispatch(setSeekingInfo({})); // clear seeking info
    dispatch(deleteTerm(termId));
    toast.success(`Term ${index + 1} deleted`);
  }

  const getMaskTop = () => {
    if (typeof document === "undefined") return 0;
    const termBody = document.getElementById(termId)?.querySelector(".term-body");
    if (!termBody) return 0;
    return termBody.scrollTop;
  }

  return (
    <Draggable draggableId={termId} index={index} isDragDisabled={isSeeking}>
      {(provided, snapshot) =>
        <div
          className="term"
          ref={provided.innerRef}
          {...provided.draggableProps}
          id={termId}
        >
          {/* term header */}
          <div 
            className={`term-header ${snapshot.isDragging ? "dragging" : ""} ${isSeeking ? "seeking" : ""}`} 
            {...provided.dragHandleProps}
          >
            <div className="term-name">{termName}</div>
            <Image className="delete-icon" src="delete.svg" alt="delete" width={20} height={20} onClick={handleDeleteTerm}/>
          </div>
          {/* droppable for courses */}
          <Droppable droppableId={termId} type={DraggingType.COURSE}>
            {(provided, snapshot) => (
              <div
                className={"term-body" + (snapshot.isDraggingOver ? " dragging-over" : "") + (isAddingCourse || isSeeking ? " overflow-hidden" : "")}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {/* add course mask */}
                <div 
                  className={`add-course-mask ${isAddingCourse ? "visible" : ""}`}
                  style={{ top: getMaskTop() }}
                  onClick={handleAddCourse}
                >
                  Click to Add Course
                </div>
                {/* courses */}
                {courseIds.map((courseId, index) => (
                  <CourseCard key={courseId} termId={termId} courseId={courseId} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {/* term footer */}
          <div className="term-footer">
            <div>{credits} credits</div>
          </div>
        </div>
      }
    </Draggable>
  )
}

export default memo(TermCard);