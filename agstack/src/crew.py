from typing import Optional, Dict, Any

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.tools import BaseTool
from pydantic import BaseModel

from src.tools import execute_code_tool


class FinalOutput(BaseModel):
    csv_file_name: str
    generated_code: str


# Create a CrewAI Tool wrapper around our function
class CodeExecutorTool(BaseTool):
    name: str = "execute_code_tool"
    description: str = "Execute the generated Python code and report results. Provides information for generating new code if execution fails."

    def __init__(self):
        super().__init__()

    def _run(self, code: str, prompt: Optional[str] = None, previous_error: Optional[str] = None,
             retry_count: int = 0) -> Dict[str, Any]:
        return execute_code_tool(code, prompt, previous_error, retry_count)


@CrewBase
class AgstackCrew():
    """agstack crew"""

    @agent
    def table_inference_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['table_inference_agent'],
            tools=[],
            verbose=True,
        )

    @agent
    def code_generator_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['code_generator_agent'],
            tools=[CodeExecutorTool()],
            verbose=True,
        )

    @task
    def infer_tables_task(self) -> Task:
        return Task(
            config=self.tasks_config['infer_tables_task'],
            agent=self.table_inference_agent(),
        )

    @task
    def generate_code_task(self) -> Task:
        return Task(
            config=self.tasks_config['generate_code_task'],
            agent=self.code_generator_agent(),
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Test crew"""
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )
