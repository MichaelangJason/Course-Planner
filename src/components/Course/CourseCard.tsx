import { Draggable } from "@hello-pangea/dnd";
import { memo, useMemo, useState } from "react";
import "@/styles/course.scss";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { deleteCourseFromTerm } from "@/store/termSlice";
import { toast } from "react-toastify";
import { CourseCode } from "@/types/course";
import { isSatisfied } from "@/utils";
import { OtherReqTitle } from "@/utils/enums";
import PreReq from "./PreReq";
import OtherReq from "./OtherReq";
import { setCourseExpanded, setCourseMounted } from "@/store/courseSlice";

export interface CourseCardProps {
  termId: string;
  courseId: string;
  index: number;
}

const useIsSatisfied = (courseId: CourseCode, termId: string) => {
  const courses = useSelector((state: RootState) => state.courses);
  const terms = useSelector((state: RootState) => state.terms);
  const { prerequisites, antirequisites, corequisites } = courses[courseId]; // will be fixed
  
  // return useMemo(() => 
  //   isSatisfied({prerequisites, antirequisites, corequisites, terms, termId}),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [terms, termId]
  // );
  return isSatisfied({prerequisites, antirequisites, corequisites, terms, termId})
}

const CourseCard = (props: CourseCardProps) => {
  const { termId, courseId, index } = props;
  const course = useSelector((state: RootState) => state.courses[courseId]);
  const { 
    name, 
    id, 
    credits, 
    prerequisites, 
    antirequisites, 
    corequisites,
    notes
  } = course;
  const dispatch = useDispatch();
  const isExpanded = useSelector((state: RootState) => state.courses[courseId].isExpanded);
  const [isRemoving, setIsRemoving] = useState(false);
  const isMounted = useSelector((state: RootState) => state.courses[courseId].isMounted); // for styling 
  // const [isMoving, setIsMoving] = useState(isMounted); // for styling during drag

  const handleRemoveCourse = () => {
    setIsRemoving(true);
    setTimeout(() => {
      dispatch(deleteCourseFromTerm({ termId, courseId }));
      dispatch(setCourseMounted({ courseId: id, isMounted: false }))
      dispatch(setCourseExpanded({ courseId, isExpanded: true })) // default to expanded
      toast.success(`${courseId} removed`);
    }, 200);
  }

  const handleCoursePageJump = () => {
    // open course page in new tab
    const domain = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN;
    const endpoint = process.env.NEXT_PUBLIC_SCHOOL_ENDPOINT;
    const id = courseId.replace(" ", "-").toLowerCase();
    window.open(`${domain}${endpoint}${id}`, "_blank");
  }

  const subsectionCheck = useMemo(() => {
    const hasPrereq = prerequisites && prerequisites.length > 0;
    const hasAntiReq = antirequisites && antirequisites.length > 0;
    const hasCoReq = corequisites && corequisites.length > 0;
    const hasNotes = notes && notes.length > 0;

    return {
      hasPrereq,
      hasAntiReq,
      hasCoReq,
      hasNotes,
      hasSubsection: hasPrereq || hasAntiReq || hasCoReq || hasNotes
    };
  }, [prerequisites, antirequisites, corequisites, notes]);

  const { hasPrereq, hasAntiReq, hasCoReq, hasNotes, hasSubsection } = subsectionCheck;
  const isSatisfied = useIsSatisfied(courseId, termId);

  // remove moving class after 100ms for animation
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsMoving(false);
  //   }, 100);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <Draggable draggableId={courseId} index={index}>
      {(provided, snapshot) => {

        const classNames = 'course-card-container' 
                        + (!isMounted ? ' fade-in' : '') 
                        + (isExpanded ? " in-term" : " in-term-folded") 
                        + (isSatisfied ? " satisfied" : " unsatisfied") 
                        + (isRemoving ? ' fade-out' : '')
                        + (snapshot.isDragging ? ' moving' : '');
        return (
        <div
          className={classNames}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="course-button-container in-term">
            {hasSubsection && 
              <div className="hot-zone" onClick={() => dispatch(setCourseExpanded({courseId, isExpanded: !isExpanded}))}>
                <Image
                  src="/expand-single.svg"
                  alt="Expand"
                  width={12}
                  height={12}
                  className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                />
              </div>
            }
            <div className="hot-zone" onClick={handleRemoveCourse}>
              <Image
                src="/delete.svg"
                alt="Delete Course"
                width={10}
                height={10}
                className="delete"
              />
            </div>
          </div>
          <div className={`course-card-info-basic`}>
            <div className="name">{name}</div>
            <div 
              className="id-credits" 
              onClick={handleCoursePageJump}
              title="Go to course page"
            >
              <b>{id}</b> ({credits} credits)
            </div>
          </div>
          {isExpanded && hasPrereq && <PreReq
            prerequisites={prerequisites!}
            termId={termId}
            isMoving={snapshot.isDragging}
          />}
          {isExpanded && hasAntiReq && <OtherReq
            data={antirequisites!}
            termId={termId}
            title={OtherReqTitle.ANTI_REQ}
            isMoving={snapshot.isDragging}
          />}
          {isExpanded && hasCoReq && <OtherReq
            data={corequisites!}
            termId={termId}
            title={OtherReqTitle.CO_REQ}
            isMoving={snapshot.isDragging}
          />}
          {isExpanded && hasNotes && <OtherReq
            data={notes!}
            termId={termId}
            title={OtherReqTitle.NOTES}
            isMoving={snapshot.isDragging}
          />}
        </div>
      )}}
    </Draggable>
  );
};

export default memo(CourseCard);