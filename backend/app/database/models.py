from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .config import Base

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    filename = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    status = Column(String, default="UPLOADED") # UPLOADED, PROFILED, DIAGNOSED
    
    profiles = relationship("DataProfile", back_populates="dataset")
    anomalies = relationship("Anomaly", back_populates="dataset")

class DataProfile(Base):
    __tablename__ = "data_profiles"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    column_name = Column(String)
    data_type = Column(String)
    missing_count = Column(Integer)
    missing_percentage = Column(Float)
    unique_count = Column(Integer)
    mean_val = Column(Float, nullable=True)
    median_val = Column(Float, nullable=True)
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    
    dataset = relationship("Dataset", back_populates="profiles")

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    column_name = Column(String)
    anomaly_type = Column(String) # e.g. MISSING_DATA, OUTLIER, DRIFT
    severity = Column(String) # HIGH, MEDIUM, LOW
    detected_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="OPEN") # OPEN, RESOLVED, ESCALATED
    description = Column(Text)
    
    dataset = relationship("Dataset", back_populates="anomalies")
    evidence = relationship("AnomalyEvidence", back_populates="anomaly")
    root_causes = relationship("RootCauseCandidate", back_populates="anomaly")
    human_collaboration = relationship("HumanCollaboration", back_populates="anomaly", uselist=False)

class AnomalyEvidence(Base):
    __tablename__ = "anomaly_evidence"
    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"))
    evidence_type = Column(String)
    description = Column(Text)
    direction = Column(String) # SUPPORTS, CONTRADICTS
    source = Column(String) # profiling_engine, drift_engine, etc.
    confidence_score = Column(Float)
    
    anomaly = relationship("Anomaly", back_populates="evidence")

class RootCauseCandidate(Base):
    __tablename__ = "root_cause_candidates"
    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"))
    cause_type = Column(String) # PIPELINE_FAILURE, BUSINESS_CHANGE, etc.
    score = Column(Float)
    reasoning = Column(Text)
    
    anomaly = relationship("Anomaly", back_populates="root_causes")

class HumanCollaboration(Base):
    __tablename__ = "human_collaboration"
    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"))
    allocation_status = Column(String) # AI_AUTONOMOUS, HUMAN_ASSISTED, HUMAN_DECISION
    question_generated = Column(Text, nullable=True)
    human_response = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    anomaly = relationship("Anomaly", back_populates="human_collaboration")
